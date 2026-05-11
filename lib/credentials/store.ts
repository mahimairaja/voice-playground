/**
 * Browser-only credentials store. Visitor-pasted provider keys live in
 * localStorage under the namespace 'mahimai_playground:cred:<key>'. Nothing
 * is sent to a server, nothing is logged. Closing the tab keeps the keys;
 * clearing site data wipes them.
 *
 * SSR-safe: every call no-ops gracefully when 'window' / 'localStorage' is
 * unavailable. The 'isPersistAvailable()' helper lets callers decide whether
 * to render UI that depends on storage actually working.
 */

export const CRED_PREFIX = 'mahimai_playground:cred:';

export type CredentialMap = Record<string, string>;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function namespacedKey(name: string): string {
  return `${CRED_PREFIX}${name}`;
}

/**
 * Returns a map containing every requested key. Missing keys are returned as
 * empty strings, so callers can render input boxes with a stable shape.
 */
export function getCredentials(keys: readonly string[]): CredentialMap {
  const store = getStorage();
  const out: CredentialMap = {};
  for (const key of keys) {
    let value = '';
    if (store) {
      try {
        value = store.getItem(namespacedKey(key)) ?? '';
      } catch {
        value = '';
      }
    }
    out[key] = value;
  }
  return out;
}

/**
 * Writes each key/value pair. Empty strings remove the namespaced item so the
 * store does not accumulate cleared fields.
 */
export function saveCredentials(map: CredentialMap): void {
  const store = getStorage();
  if (!store) return;
  for (const [key, value] of Object.entries(map)) {
    try {
      if (value === '') {
        store.removeItem(namespacedKey(key));
      } else {
        store.setItem(namespacedKey(key), value);
      }
    } catch {
      /* quota or private mode; skip */
    }
  }
}

/**
 * Removes every namespaced credential. Other localStorage entries (theme,
 * clean mode, etc.) are untouched.
 */
export function clearAll(): void {
  const store = getStorage();
  if (!store) return;
  let toRemove: string[];
  try {
    toRemove = [];
    for (let i = 0; i < store.length; i += 1) {
      const k = store.key(i);
      if (k && k.startsWith(CRED_PREFIX)) toRemove.push(k);
    }
  } catch {
    return;
  }
  for (const k of toRemove) {
    try {
      store.removeItem(k);
    } catch {
      /* skip */
    }
  }
}

/**
 * True when every requested key is present and non-empty in storage. False
 * during SSR or when storage is unavailable.
 */
export function hasAll(keys: readonly string[]): boolean {
  if (keys.length === 0) return true;
  const store = getStorage();
  if (!store) return false;
  for (const key of keys) {
    let v: string | null;
    try {
      v = store.getItem(namespacedKey(key));
    } catch {
      return false;
    }
    if (!v || v.length === 0) return false;
  }
  return true;
}

/**
 * True when the runtime can persist credentials. Useful before rendering UI
 * that promises persistence (the drawer's 'Save' button, for example).
 */
export function isPersistAvailable(): boolean {
  return getStorage() !== null;
}
