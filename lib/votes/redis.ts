import { Redis } from '@upstash/redis';

/** Cookie holding the anonymous voter id. */
export const VID_COOKIE = 'vid';

/**
 * The minimal Redis surface the vote store uses. Naming it lets `store.ts` be
 * unit-tested against an in-memory fake; the real Upstash client satisfies it.
 */
export interface VoteRedis {
  sismember(key: string, member: string): Promise<number>;
  sadd(key: string, member: string): Promise<number>;
  srem(key: string, member: string): Promise<number>;
  smembers(key: string): Promise<string[]>;
  hincrby(key: string, field: string, increment: number): Promise<number>;
  hgetall<T extends Record<string, unknown>>(key: string): Promise<T | null>;
}

let cached: VoteRedis | null | undefined;

/**
 * The Upstash client built from env, or null when the env vars are absent so the
 * feature degrades to off instead of throwing. Accepts both the Upstash and the
 * Vercel KV variable names. Memoized across invocations.
 */
export function getRedis(): VoteRedis | null {
  if (cached !== undefined) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  cached = url && token ? (new Redis({ url, token }) as unknown as VoteRedis) : null;
  return cached;
}
