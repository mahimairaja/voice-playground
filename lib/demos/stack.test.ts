import { describe, expect, it } from 'vitest';
import { demoUsesProvider, stackProviders } from './stack';

describe('stackProviders', () => {
  it('returns three providers in stt, llm, tts order', () => {
    expect(stackProviders({ stt: 'deepgram', llm: 'openai', tts: 'cartesia' })).toEqual([
      'deepgram',
      'openai',
      'cartesia',
    ]);
  });

  it('collapses a single-provider stack to one', () => {
    expect(stackProviders({ stt: 'openai', llm: 'openai', tts: 'openai' })).toEqual(['openai']);
  });

  it('lowercases and trims', () => {
    expect(stackProviders({ stt: ' Deepgram ', llm: 'OpenAI', tts: 'openai' })).toEqual([
      'deepgram',
      'openai',
    ]);
  });

  it('is empty for a missing stack', () => {
    expect(stackProviders(undefined)).toEqual([]);
  });
});

describe('demoUsesProvider', () => {
  const stack = { stt: 'deepgram', llm: 'openai', tts: 'cartesia' };

  it('matches a provider in any role, case-insensitively', () => {
    expect(demoUsesProvider(stack, 'cartesia')).toBe(true);
    expect(demoUsesProvider(stack, 'OpenAI')).toBe(true);
  });

  it('does not match an absent provider or a missing stack', () => {
    expect(demoUsesProvider(stack, 'nvidia')).toBe(false);
    expect(demoUsesProvider(undefined, 'openai')).toBe(false);
  });
});
