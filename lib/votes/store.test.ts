import { describe, expect, it } from 'vitest';
import type { VoteRedis } from './redis';
import { readVotes, toggleVote } from './store';

function fakeRedis(): VoteRedis {
  const sets = new Map<string, Set<string>>();
  const hashes = new Map<string, Map<string, number>>();
  const set = (k: string) => {
    let s = sets.get(k);
    if (!s) sets.set(k, (s = new Set()));
    return s;
  };
  const hash = (k: string) => {
    let h = hashes.get(k);
    if (!h) hashes.set(k, (h = new Map()));
    return h;
  };
  return {
    async sismember(key, member) {
      return set(key).has(member) ? 1 : 0;
    },
    async sadd(key, member) {
      const s = set(key);
      const had = s.has(member);
      s.add(member);
      return had ? 0 : 1;
    },
    async srem(key, member) {
      const s = set(key);
      const had = s.has(member);
      s.delete(member);
      return had ? 1 : 0;
    },
    async smembers(key) {
      return [...set(key)];
    },
    async hincrby(key, field, increment) {
      const h = hash(key);
      const next = (h.get(field) ?? 0) + increment;
      h.set(field, next);
      return next;
    },
    async hgetall(key) {
      const h = hashes.get(key);
      return h ? (Object.fromEntries(h) as never) : null;
    },
  };
}

describe('vote store', () => {
  it('votes, dedupes across voters, and toggles off', async () => {
    const r = fakeRedis();
    expect(await toggleVote(r, 'drive-thru', 'v1')).toEqual({ count: 1, voted: true });
    expect(await toggleVote(r, 'drive-thru', 'v2')).toEqual({ count: 2, voted: true });
    // same voter again removes their vote
    expect(await toggleVote(r, 'drive-thru', 'v1')).toEqual({ count: 1, voted: false });
  });

  it('floors the count at zero', async () => {
    const r = fakeRedis();
    await toggleVote(r, 'x', 'v1');
    expect(await toggleVote(r, 'x', 'v1')).toEqual({ count: 0, voted: false });
  });

  it('readVotes returns counts and the voter slugs', async () => {
    const r = fakeRedis();
    await toggleVote(r, 'a', 'v1');
    await toggleVote(r, 'b', 'v1');
    await toggleVote(r, 'a', 'v2');
    const { counts, voted } = await readVotes(r, 'v1');
    expect(counts).toEqual({ a: 2, b: 1 });
    expect([...voted].sort()).toEqual(['a', 'b']);
  });

  it('readVotes without a vid returns no voted slugs', async () => {
    const r = fakeRedis();
    await toggleVote(r, 'a', 'v1');
    expect(await readVotes(r, null)).toEqual({ counts: { a: 1 }, voted: [] });
  });
});
