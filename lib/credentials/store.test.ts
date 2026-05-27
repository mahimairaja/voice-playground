import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CRED_PREFIX,
  clearAll,
  getCredentials,
  hasAll,
  isPersistAvailable,
  saveCredentials,
} from './store';

describe('lib/credentials/store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('isPersistAvailable reports true in jsdom', () => {
    expect(isPersistAvailable()).toBe(true);
  });

  it('getCredentials returns empty strings for unset keys', () => {
    expect(getCredentials(['livekit_url', 'openai_api_key'])).toEqual({
      livekit_url: '',
      openai_api_key: '',
    });
  });

  it('saveCredentials round-trips through getCredentials', () => {
    saveCredentials({
      livekit_url: 'wss://example.livekit.cloud',
      openai_api_key: 'sk-test',
    });
    expect(getCredentials(['livekit_url', 'openai_api_key'])).toEqual({
      livekit_url: 'wss://example.livekit.cloud',
      openai_api_key: 'sk-test',
    });
  });

  it('saveCredentials with an empty value removes the entry', () => {
    saveCredentials({ openai_api_key: 'sk-test' });
    expect(window.localStorage.getItem(`${CRED_PREFIX}openai_api_key`)).toBe('sk-test');
    saveCredentials({ openai_api_key: '' });
    expect(window.localStorage.getItem(`${CRED_PREFIX}openai_api_key`)).toBeNull();
  });

  it('clearAll removes every prefixed entry but preserves others', () => {
    saveCredentials({ livekit_url: 'wss://a', openai_api_key: 'sk-1' });
    window.localStorage.setItem('unrelated_key', 'keep me');
    clearAll();
    expect(window.localStorage.getItem(`${CRED_PREFIX}livekit_url`)).toBeNull();
    expect(window.localStorage.getItem(`${CRED_PREFIX}openai_api_key`)).toBeNull();
    expect(window.localStorage.getItem('unrelated_key')).toBe('keep me');
  });

  it('hasAll reports true only when every requested key is non-empty', () => {
    expect(hasAll([])).toBe(true);
    expect(hasAll(['livekit_url'])).toBe(false);
    saveCredentials({ livekit_url: 'wss://a' });
    expect(hasAll(['livekit_url'])).toBe(true);
    expect(hasAll(['livekit_url', 'openai_api_key'])).toBe(false);
    saveCredentials({ openai_api_key: 'sk-1' });
    expect(hasAll(['livekit_url', 'openai_api_key'])).toBe(true);
  });
});
