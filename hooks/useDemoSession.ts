'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import type { RejectionDetail } from '@/components/playground/CredentialsBanner';
import { type CredentialMap, getCredentials } from '@/lib/credentials/store';
import { missingCredentials } from '@/lib/credentials/validate';

export type SessionState = 'idle' | 'connecting' | 'live' | 'ended' | 'error';

export interface UseDemoSessionOptions {
  slug: string;
  requiredCredentials: readonly string[];
  /** Override the token endpoint. Default: '/api/token'. */
  tokenUrl?: string;
}

export interface UseDemoSessionReturn {
  state: SessionState;
  error: Error | null;
  room: Room | null;
  rejected: RejectionDetail | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setRejected: (detail: RejectionDetail | null) => void;
}

const LIVEKIT_KEYS = ['livekit_url', 'livekit_api_key', 'livekit_api_secret'] as const;

class MissingCredentialsError extends Error {
  constructor(public readonly missing: readonly string[]) {
    super(`Missing required keys: ${missing.join(', ')}.`);
    this.name = 'MissingCredentialsError';
  }
}

class TokenRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'TokenRequestError';
  }
}

interface TokenResponse {
  wsUrl: string;
  token: string;
  roomName: string;
  participantIdentity: string;
  participantName: string;
  expiresAt: number;
}

async function mintToken(
  tokenUrl: string,
  slug: string,
  livekit: Pick<CredentialMap, 'livekit_url' | 'livekit_api_key' | 'livekit_api_secret'>
): Promise<TokenResponse> {
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      livekit_url: livekit.livekit_url,
      livekit_api_key: livekit.livekit_api_key,
      livekit_api_secret: livekit.livekit_api_secret,
      demo_slug: slug,
    }),
  });

  if (!res.ok) {
    let message = `Token endpoint returned HTTP ${res.status}.`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body && typeof body.error === 'string') message = body.error;
    } catch {
      /* ignore body parse failure */
    }
    throw new TokenRequestError(res.status, message);
  }

  return (await res.json()) as TokenResponse;
}

export function useDemoSession({
  slug,
  requiredCredentials,
  tokenUrl = '/api/token',
}: UseDemoSessionOptions): UseDemoSessionReturn {
  const [state, setState] = useState<SessionState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [rejected, setRejectedState] = useState<RejectionDetail | null>(null);

  const roomRef = useRef<Room | null>(null);
  const inFlightRef = useRef(false);

  const setRejected = useCallback((detail: RejectionDetail | null) => {
    setRejectedState(detail);
  }, []);

  const teardown = useCallback(async (next: SessionState) => {
    const r = roomRef.current;
    roomRef.current = null;
    setRoom(null);
    if (r) {
      try {
        await r.disconnect();
      } catch {
        /* ignore disconnect failures */
      }
    }
    setState(next);
  }, []);

  const connect = useCallback(async () => {
    if (inFlightRef.current) return;
    if (state === 'live' || state === 'connecting') return;

    inFlightRef.current = true;
    setError(null);
    setRejectedState(null);
    setState('connecting');

    try {
      const allRequired = Array.from(new Set([...LIVEKIT_KEYS, ...requiredCredentials]));
      const missing = missingCredentials(allRequired);
      if (missing.length > 0) {
        throw new MissingCredentialsError(missing);
      }

      const creds = getCredentials(allRequired);
      const tokenResponse = await mintToken(tokenUrl, slug, {
        livekit_url: creds.livekit_url,
        livekit_api_key: creds.livekit_api_key,
        livekit_api_secret: creds.livekit_api_secret,
      });

      const r = new Room();

      r.on(RoomEvent.Disconnected, () => {
        if (roomRef.current === r) {
          roomRef.current = null;
          setRoom(null);
          setState((s) => (s === 'connecting' ? 'error' : 'ended'));
        }
      });

      await r.connect(tokenResponse.wsUrl, tokenResponse.token);

      roomRef.current = r;
      setRoom(r);
      setState('live');
    } catch (err) {
      await teardown('error');
      const e = err instanceof Error ? err : new Error('Unknown error connecting to session.');
      setError(e);
    } finally {
      inFlightRef.current = false;
    }
  }, [slug, requiredCredentials, tokenUrl, state, teardown]);

  const disconnect = useCallback(async () => {
    if (state !== 'live' && state !== 'connecting') return;
    await teardown('ended');
  }, [state, teardown]);

  useEffect(() => {
    return () => {
      const r = roomRef.current;
      roomRef.current = null;
      if (r) {
        r.disconnect().catch(() => {
          /* ignore on unmount */
        });
      }
    };
  }, []);

  return { state, error, room, rejected, connect, disconnect, setRejected };
}

export { MissingCredentialsError, TokenRequestError };
