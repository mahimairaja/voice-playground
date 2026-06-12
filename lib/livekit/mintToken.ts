'use client';

import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

/**
 * Browser-side LiveKit token mint. The visitor's LiveKit URL, API key, and
 * secret live in 'localStorage' (per F1.1 credentials store). We sign a JWT
 * here so the playground never has to operate a server-side route holding
 * customer secrets.
 *
 * Implemented with 'jose' rather than 'livekit-server-sdk' because the latter
 * pulls 'node:crypto' through its 'RoomServiceClient' export at bundle time,
 * which Next's client bundler cannot resolve. The JWT claim shape matches
 * what 'AccessToken' would have produced ('iss', 'sub', 'video' grants).
 */

export type MintTokenField = 'livekit_url' | 'livekit_api_key' | 'livekit_api_secret';

export class MintTokenError extends Error {
  constructor(
    public readonly field: MintTokenField,
    message: string
  ) {
    super(message);
    this.name = 'MintTokenError';
  }
}

export interface MintTokenArgs {
  livekit_url: string;
  livekit_api_key: string;
  livekit_api_secret: string;
  /** Demo slug; used only to namespace the auto-generated room. */
  slug: string;
  /**
   * Named agent to dispatch into the room. Cookbook agents register with
   * agent_name equal to the demo slug, and LiveKit only dispatches named
   * workers when the token's roomConfig asks for them explicitly; without
   * this claim the worker registers and idles while the visitor sits alone.
   */
  agentName?: string;
  /** Optional explicit identity. Defaults to 'visitor_<nanoid6>'. */
  identity?: string;
  /** Optional explicit room name. Defaults to '<slug>_<nanoid6>'. */
  room?: string;
  /** Token lifetime in seconds. Default 1 hour. */
  ttlSeconds?: number;
}

export interface MintTokenResult {
  wsUrl: string;
  token: string;
  roomName: string;
  identity: string;
  expiresAt: number;
}

interface LiveKitVideoGrant {
  room: string;
  roomJoin: boolean;
  canPublish: boolean;
  canSubscribe: boolean;
  canPublishData: boolean;
}

const LIVEKIT_URL_PATTERN = /^wss?:\/\/.+$/;
const DEFAULT_TTL_SECONDS = 3600;

export async function mintToken(args: MintTokenArgs): Promise<MintTokenResult> {
  if (!LIVEKIT_URL_PATTERN.test(args.livekit_url)) {
    throw new MintTokenError('livekit_url', 'must be a ws:// or wss:// URL');
  }
  if (!args.livekit_api_key || args.livekit_api_key.length === 0) {
    throw new MintTokenError('livekit_api_key', 'is empty');
  }
  if (!args.livekit_api_secret || args.livekit_api_secret.length === 0) {
    throw new MintTokenError('livekit_api_secret', 'is empty');
  }

  const identity = args.identity ?? `visitor_${nanoid(6)}`;
  const roomName = args.room ?? `${args.slug}_${nanoid(6)}`;
  const ttl = args.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = nowSeconds + ttl;

  const grant: LiveKitVideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  };

  const secret = new TextEncoder().encode(args.livekit_api_secret);
  // Claim shape matches livekit server SDKs: AccessToken.with_room_config
  // serializes RoomConfiguration as a camelCase `roomConfig` claim.
  const claims: { video: LiveKitVideoGrant; roomConfig?: object } = { video: grant };
  if (args.agentName) {
    claims.roomConfig = { agents: [{ agentName: args.agentName }] };
  }
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(args.livekit_api_key)
    .setSubject(identity)
    .setIssuedAt(nowSeconds)
    .setNotBefore(nowSeconds)
    .setExpirationTime(expiresAt)
    .sign(secret);

  return { wsUrl: args.livekit_url, token, roomName, identity, expiresAt };
}
