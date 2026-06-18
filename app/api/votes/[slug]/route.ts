import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getShippedBySlug } from '@/lib/demos';
import { VID_COOKIE, getRedis } from '@/lib/votes/redis';
import { toggleVote } from '@/lib/votes/store';

export const dynamic = 'force-dynamic';

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Toggle the current visitor's upvote for a demo. The slug is validated against
 * the catalog so junk keys cannot bloat Redis. On the first vote a random,
 * anonymous `vid` cookie is minted. Returns the new count and voted state.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }

  const { slug } = await params;
  let demo;
  try {
    demo = await getShippedBySlug(slug);
  } catch {
    return NextResponse.json({ error: 'catalog unavailable' }, { status: 503 });
  }
  if (!demo) {
    return NextResponse.json({ error: 'unknown demo' }, { status: 404 });
  }

  const store = await cookies();
  let vid = store.get(VID_COOKIE)?.value;
  const isNew = !vid;
  if (!vid) vid = randomUUID();

  const state = await toggleVote(redis, slug, vid);
  const res = NextResponse.json({ configured: true, ...state });
  if (isNew) {
    res.cookies.set(VID_COOKIE, vid, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ONE_YEAR,
      path: '/',
    });
  }
  return res;
}
