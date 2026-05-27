/**
 * Credential validation for the demo runtime.
 *
 * 'missingCredentials' is synchronous and decides whether the user has pasted
 * every key the session needs (the three LiveKit values). It is the gate for
 * the 'Talk' button.
 *
 * The agent worker runs locally and reads provider keys (OpenAI, Deepgram,
 * etc.) from its own '.env'. The playground never touches them, so there is
 * no in-browser provider-ping layer here.
 */
import { type CredentialMap, getCredentials } from './store';

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
