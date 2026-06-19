import { describe, expect, it } from 'vitest';
import { buildJoinLink, parseFragment } from './links';

describe('buildJoinLink', () => {
  it('packs wsUrl and token into the fragment', () => {
    const link = buildJoinLink('https://play.example', 'wss://lk.example', 'tok123');
    expect(link).toBe('https://play.example/join#u=wss%3A%2F%2Flk.example&t=tok123');
  });

  it('strips a trailing slash from the origin', () => {
    const link = buildJoinLink('https://play.example/', 'wss://lk.example', 'tok123');
    expect(link.startsWith('https://play.example/join#')).toBe(true);
  });
});

describe('parseFragment', () => {
  it('round-trips a built link fragment', () => {
    const link = buildJoinLink('https://play.example', 'wss://lk.example', 'tok123');
    const hash = '#' + link.split('#')[1];
    expect(parseFragment(hash)).toEqual({ wsUrl: 'wss://lk.example', token: 'tok123' });
  });

  it('returns null for an empty or partial fragment', () => {
    expect(parseFragment('')).toBeNull();
    expect(parseFragment('#u=wss://x')).toBeNull();
  });
});
