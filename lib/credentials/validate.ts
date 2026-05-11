/**
 * Credential validation for the demo runtime.
 *
 * Two layers:
 * 1. 'missingCredentials' is synchronous and decides whether the user has
 *    pasted every key the demo's manifest declares. It is the gate for the
 *    'Start session' button.
 * 2. 'pingProvider' / 'pingAll' is the optional async layer that hits the
 *    provider's API to verify a key is actually accepted before the call.
 *    Saves the user from seeing a 401 mid-session.
 *
 * Provider pings are best-effort: when CORS blocks the request or the
 * provider returns an unexpected status, the result is 'unreachable' rather
 * than 'rejected'. The user can still attempt to start a session; the agent
 * worker will surface the authoritative error if the key is bad.
 */
import { type CredentialMap, getCredentials } from './store';

export type PingResult =
  | { kind: 'ok'; provider: string }
  | { kind: 'rejected'; provider: string; status: number; message: string }
  | { kind: 'unreachable'; provider: string; message: string }
  | { kind: 'unsupported'; provider: string };

interface ProviderConfig {
  url: string;
  authHeader: string;
  authValue: (key: string) => string;
}

/**
 * Map of provider names (as they appear in 'manifest.required_credentials')
 * to the endpoint and auth shape used to ping them. Add a new entry here when
 * a demo introduces a new provider.
 *
 * Provider key conventions (rough, used for the inline regex hint, not enforced):
 *   openai:   sk- ...
 *   deepgram: 40-hex token
 *   cartesia: sk_ ...
 */
const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    url: 'https://api.openai.com/v1/models',
    authHeader: 'Authorization',
    authValue: (key) => `Bearer ${key}`,
  },
  deepgram: {
    url: 'https://api.deepgram.com/v1/projects',
    authHeader: 'Authorization',
    authValue: (key) => `Token ${key}`,
  },
  cartesia: {
    url: 'https://api.cartesia.ai/api-keys',
    authHeader: 'X-API-Key',
    authValue: (key) => key,
  },
};

/**
 * Returns the keys from 'required' that are NOT present (or are empty) in the
 * credentials store. Caller picks how to surface the result (banner, drawer
 * autofocus, disabled button, etc.).
 */
export function missingCredentials(required: readonly string[]): string[] {
  if (required.length === 0) return [];
  const map = getCredentials(required);
  return required.filter((key) => !map[key] || map[key].length === 0);
}

/**
 * Same shape as 'missingCredentials' but takes an in-memory 'CredentialMap'
 * (e.g. while editing the drawer before save). Pure, no storage access.
 */
export function missingCredentialsIn(map: CredentialMap, required: readonly string[]): string[] {
  return required.filter((key) => !map[key] || map[key].length === 0);
}

/**
 * Asks the provider whether the key is accepted. Best-effort: CORS blocks,
 * timeouts, and unexpected status codes resolve to 'unreachable' so the
 * caller can retry or just let the agent worker decide.
 */
export async function pingProvider(provider: string, key: string): Promise<PingResult> {
  const cfg = PROVIDERS[provider];
  if (!cfg) return { kind: 'unsupported', provider };
  if (!key || key.length === 0) {
    return { kind: 'rejected', provider, status: 400, message: 'Key is empty.' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(cfg.url, {
      method: 'GET',
      headers: { [cfg.authHeader]: cfg.authValue(key) },
      signal: controller.signal,
    });

    if (res.ok) return { kind: 'ok', provider };
    if (res.status === 401 || res.status === 403) {
      return {
        kind: 'rejected',
        provider,
        status: res.status,
        message: `${provider} rejected the key (HTTP ${res.status}).`,
      };
    }
    return {
      kind: 'unreachable',
      provider,
      message: `${provider} responded with HTTP ${res.status}.`,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    return { kind: 'unreachable', provider, message: `Could not reach ${provider}: ${reason}.` };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Pings every provider in 'map' in parallel and returns the results keyed by
 * provider name. Useful for a 'Verify keys' button on the credentials drawer.
 */
export async function pingAll(map: CredentialMap): Promise<Record<string, PingResult>> {
  const entries = Object.entries(map).filter(([, value]) => value.length > 0);
  const results = await Promise.all(
    entries.map(
      async ([provider, value]) => [provider, await pingProvider(provider, value)] as const
    )
  );
  return Object.fromEntries(results);
}

/**
 * True when every requested key has a 'kind: ok' or 'kind: unreachable' ping
 * result. 'unreachable' is treated as pass because the user has supplied a
 * value and the provider could not be reached, which is not their fault.
 */
export function allKeysAcceptedOrUnreachable(results: Record<string, PingResult>): boolean {
  return Object.values(results).every((r) => r.kind === 'ok' || r.kind === 'unreachable');
}

/**
 * Names of the providers we know how to validate. Useful for the drawer's
 * 'live check' indicator.
 */
export function knownProviders(): readonly string[] {
  return Object.keys(PROVIDERS);
}
