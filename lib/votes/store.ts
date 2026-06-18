import type { VoteRedis } from './redis';

/**
 * Vote storage over Redis. A hash holds per-slug counts; a SET per slug holds
 * the anonymous voter ids that upvoted it (the dedupe guard); a reverse SET per
 * voter records which slugs they hit, so "what have I voted for" is one read.
 */

const COUNTS_KEY = 'votes:counts';
const votersKey = (slug: string) => `votes:voters:${slug}`;
const byVoterKey = (vid: string) => `votes:byvoter:${vid}`;

export interface VoteState {
  count: number;
  voted: boolean;
}

const floor = (n: number): number => (n > 0 ? n : 0);

/**
 * Toggle a voter's vote for a slug. A voter who has not voted adds one and is
 * recorded; a voter who has removes theirs. Returns the new count (floored at 0)
 * and whether the voter now has a vote on this slug.
 */
export async function toggleVote(redis: VoteRedis, slug: string, vid: string): Promise<VoteState> {
  const isMember = await redis.sismember(votersKey(slug), vid);
  if (isMember) {
    await redis.srem(votersKey(slug), vid);
    await redis.srem(byVoterKey(vid), slug);
    const count = await redis.hincrby(COUNTS_KEY, slug, -1);
    return { count: floor(count), voted: false };
  }
  await redis.sadd(votersKey(slug), vid);
  await redis.sadd(byVoterKey(vid), slug);
  const count = await redis.hincrby(COUNTS_KEY, slug, 1);
  return { count: floor(count), voted: true };
}

/** Every slug's count, plus the slugs this voter has upvoted (empty without a vid). */
export async function readVotes(
  redis: VoteRedis,
  vid: string | null
): Promise<{ counts: Record<string, number>; voted: string[] }> {
  const raw = await redis.hgetall<Record<string, unknown>>(COUNTS_KEY);
  const counts: Record<string, number> = {};
  if (raw) {
    for (const [slug, value] of Object.entries(raw)) {
      counts[slug] = floor(Number(value) || 0);
    }
  }
  const voted = vid ? await redis.smembers(byVoterKey(vid)) : [];
  return { counts, voted };
}
