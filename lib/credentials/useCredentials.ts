'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CRED_CHANGE_EVENT,
  type CredentialMap,
  clearAll,
  getCredentials,
  isPersistAvailable,
  saveCredentials,
} from './store';
import { missingCredentials } from './validate';

/**
 * Thin React layer over 'lib/credentials/store.ts' and 'validate.ts'. Single
 * source of truth for the demo page's keys UI: 'isReady', 'missing',
 * 'unavailable' all derive from the same store state, so the credentials
 * sheet and the Talk button can never disagree.
 *
 * Subscribes to:
 * - the native 'storage' event (cross-tab updates from another window), and
 * - the in-tab '{@link CRED_CHANGE_EVENT}' window event (same-tab updates
 *   triggered by our own 'saveCredentials' / 'clearAll'; the native 'storage'
 *   event does not fire in the writing tab).
 */

export interface UseCredentialsResult {
  /** Latest snapshot of the requested keys. Missing keys read as ''. */
  values: CredentialMap;
  /** Persist a single field. Calls 'saveCredentials' under the hood. */
  setKey: (name: string, value: string) => void;
  /** Wipe every namespaced credential from storage. */
  clearAll: () => void;
  /** Persist the entire in-memory map in one shot (used by the sheet save). */
  saveMany: (map: CredentialMap) => void;
  /** True when every required key has a non-empty stored value. */
  isReady: boolean;
  /** Names of required keys not yet filled. */
  missing: string[];
  /** True when 'localStorage' is unavailable (private mode, blocked). */
  unavailable: boolean;
}

export function useCredentials(required: readonly string[]): UseCredentialsResult {
  const [tick, setTick] = useState(0);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    setUnavailable(!isPersistAvailable());
    const onChange = () => setTick((n) => n + 1);
    window.addEventListener('storage', onChange);
    window.addEventListener(CRED_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener(CRED_CHANGE_EVENT, onChange);
    };
  }, []);

  const requiredKey = required.join('|');
  const values = useDerivedValues(required, tick, requiredKey);
  const missing = useDerivedMissing(required, tick, requiredKey);

  const setKey = useCallback((name: string, value: string) => {
    saveCredentials({ [name]: value });
  }, []);

  const saveMany = useCallback((map: CredentialMap) => {
    saveCredentials(map);
  }, []);

  const clear = useCallback(() => {
    clearAll();
  }, []);

  return {
    values,
    setKey,
    saveMany,
    clearAll: clear,
    isReady: missing.length === 0,
    missing,
    unavailable,
  };
}

function useDerivedValues(
  required: readonly string[],
  tick: number,
  requiredKey: string
): CredentialMap {
  const [values, setValues] = useState<CredentialMap>(() =>
    Object.fromEntries(required.map((k) => [k, '']))
  );
  useEffect(() => {
    setValues(getCredentials(required));
    // tick + requiredKey participate in the dep set; the array reference itself
    // changes per render so we depend on its joined form instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, requiredKey]);
  return values;
}

function useDerivedMissing(
  required: readonly string[],
  tick: number,
  requiredKey: string
): string[] {
  const [missing, setMissing] = useState<string[]>(() => [...required]);
  useEffect(() => {
    setMissing(missingCredentials(required));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, requiredKey]);
  return missing;
}
