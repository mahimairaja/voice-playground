import { describe, expect, it } from 'vitest';
import { resolveMessageOrigin } from './agent-chat-transcript';

// Guards the speaker-labelling bug: STT transcript lines carry the speaker in
// `type` and have no `from`, so reading `from.isLocal` alone labelled every
// line (user and agent both) as the agent.
describe('resolveMessageOrigin', () => {
  it('labels a user STT transcript line as the user', () => {
    expect(resolveMessageOrigin({ type: 'userTranscript' })).toBe('user');
  });

  it('labels an agent STT transcript line as the assistant', () => {
    expect(resolveMessageOrigin({ type: 'agentTranscript' })).toBe('assistant');
  });

  it('labels a local chat message as the user via from.isLocal', () => {
    expect(resolveMessageOrigin({ type: 'chatMessage', from: { isLocal: true } })).toBe('user');
  });

  it('labels a remote chat message as the assistant', () => {
    expect(resolveMessageOrigin({ type: 'chatMessage', from: { isLocal: false } })).toBe(
      'assistant'
    );
  });

  it('falls back to assistant when neither signal marks the user', () => {
    expect(resolveMessageOrigin({})).toBe('assistant');
  });
});
