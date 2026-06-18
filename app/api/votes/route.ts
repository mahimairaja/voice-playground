import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { VID_COOKIE, getRedis } from '@/lib/votes/redis';
import { readVotes } from '@/lib/votes/store';

// Votes are live; never serve a cached response.
export const dynamic = 'force-dynamic';

/**
 * All vote counts plus the slugs the current visitor (by `vid` cookie) has
 * upvoted. Reports `configured: false` when Redis is not set up, so the client
 * can render the buttons as off rather than erroring.
 */
export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ configured: false, counts: {}, voted: [] });
  }
  const vid = (await cookies()).get(VID_COOKIE)?.value ?? null;
  const { counts, voted } = await readVotes(redis, vid);
  return NextResponse.json({ configured: true, counts, voted });
}
