import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { saveCredentials } from './store';
import { missingCredentials, missingCredentialsIn } from './validate';

describe('lib/credentials/validate', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('missingCredentials returns [] for an empty required list', () => {
    expect(missingCredentials([])).toEqual([]);
  });

  it('missingCredentials returns the full required list when nothing is stored', () => {
    expect(missingCredentials(['livekit_url', 'openai_api_key'])).toEqual([
      'livekit_url',
      'openai_api_key',
    ]);
  });

  it('missingCredentials returns only the unfilled subset', () => {
    saveCredentials({ livekit_url: 'wss://a' });
    expect(missingCredentials(['livekit_url', 'openai_api_key'])).toEqual(['openai_api_key']);
  });

  it('missingCredentials returns [] when every required key is stored', () => {
    saveCredentials({ livekit_url: 'wss://a', openai_api_key: 'sk-1' });
    expect(missingCredentials(['livekit_url', 'openai_api_key'])).toEqual([]);
  });

  it('missingCredentialsIn is pure and ignores localStorage', () => {
    saveCredentials({ livekit_url: 'wss://a' });
    expect(missingCredentialsIn({}, ['livekit_url'])).toEqual(['livekit_url']);
    expect(missingCredentialsIn({ livekit_url: 'wss://b' }, ['livekit_url'])).toEqual([]);
  });
});
