import { NextResponse } from 'next/server';
import { AccessToken, type VideoGrant } from 'livekit-server-sdk';
import { z } from 'zod';

/**
 * Visitor-bring-your-own-keys token mint.
 *
 * The playground does not own LiveKit credentials. The visitor pastes their
 * own LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET into the
 * credentials drawer. Those values are POSTed here, used to sign a short-
 * lived (1 h) AccessToken, and discarded. Nothing is persisted, nothing is
 * logged. Even the error path strips the secret from the message.
 *
 * The agent worker (Python, in 'awesome-voice-apps') joins the same room
 * with its own credentials supplied separately to its dispatch hook.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REQUEST_SCHEMA = z.object({
  livekit_url: z
    .string()
    .regex(/^wss?:\/\/.+$/, { message: 'livekit_url must be a ws:// or wss:// URL' }),
  livekit_api_key: z.string().min(1),
  livekit_api_secret: z.string().min(1),
  /** Optional explicit room name. Otherwise a random 'mahimai_<n>' room is minted. */
  room: z.string().min(1).max(64).optional(),
  /** Optional explicit participant identity. Otherwise a random 'visitor_<n>' identity is used. */
  identity: z.string().min(1).max(64).optional(),
  /** Optional human-readable name for the participant. */
  name: z.string().min(1).max(64).optional(),
  /** Optional structured metadata attached to the participant. */
  metadata: z.record(z.string(), z.unknown()).optional(),
  /** Optional demo slug, used only to namespace the auto-generated room. */
  demo_slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

interface TokenResponse {
  wsUrl: string;
  token: string;
  roomName: string;
  participantIdentity: string;
  participantName: string;
  expiresAt: number;
}

const TOKEN_TTL_SECONDS = 60 * 60;

function randomSuffix(): string {
  return Math.floor(Math.random() * 1_000_000)
    .toString(36)
    .padStart(4, '0');
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'Request body must be valid JSON.');
  }

  const parsed = REQUEST_SCHEMA.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join('.') || '<root>').join(', ');
    return jsonError(400, `Invalid request body: ${fields}.`);
  }

  const {
    livekit_url,
    livekit_api_key,
    livekit_api_secret,
    room,
    identity,
    name,
    metadata,
    demo_slug,
  } = parsed.data;

  const slugPrefix = demo_slug ? `${demo_slug}_` : '';
  const roomName = room ?? `mahimai_${slugPrefix}${randomSuffix()}`;
  const participantIdentity = identity ?? `visitor_${randomSuffix()}`;
  const participantName = name ?? 'visitor';

  let token: string;
  try {
    const at = new AccessToken(livekit_api_key, livekit_api_secret, {
      identity: participantIdentity,
      name: participantName,
      ttl: TOKEN_TTL_SECONDS,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };
    at.addGrant(grant);

    token = await at.toJwt();
  } catch {
    /*
     * The SDK can throw for malformed key shapes. Strip any chance of leaking
     * the secret by reporting only a generic error message.
     */
    return jsonError(400, 'Could not sign token. Verify the LiveKit key and secret format.');
  }

  const payload: TokenResponse = {
    wsUrl: livekit_url,
    token,
    roomName,
    participantIdentity,
    participantName,
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };

  return new NextResponse(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function jsonError(status: number, message: string): NextResponse {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
