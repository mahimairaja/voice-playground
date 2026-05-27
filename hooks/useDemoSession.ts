'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { LIVEKIT_KEYS, getCredentials } from '@/lib/credentials/store';
import type { RejectionDetail } from '@/lib/credentials/types';
import { missingCredentials } from '@/lib/credentials/validate';
import { MintTokenError, mintToken } from '@/lib/livekit/mintToken';

export type SessionState = 'idle' | 'connecting' | 'live' | 'ended' | 'error';

export interface UseDemoSessionOptions {
  slug: string;
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

class MissingCredentialsError extends Error {
  constructor(public readonly missing: readonly string[]) {
    super(`Missing required keys: ${missing.join(', ')}.`);
    this.name = 'MissingCredentialsError';
  }
}

export function useDemoSession({ slug }: UseDemoSessionOptions): UseDemoSessionReturn {
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

    let pendingRoom: Room | null = null;
    try {
      const missing = missingCredentials(LIVEKIT_KEYS);
      if (missing.length > 0) {
        throw new MissingCredentialsError(missing);
      }

      const creds = getCredentials(LIVEKIT_KEYS);
      const tokenResponse = await mintToken({
        livekit_url: creds.livekit_url,
        livekit_api_key: creds.livekit_api_key,
        livekit_api_secret: creds.livekit_api_secret,
        slug,
      });

      const r = new Room();
      pendingRoom = r;

      r.on(RoomEvent.Disconnected, () => {
        if (roomRef.current === r) {
          roomRef.current = null;
          setRoom(null);
          setState((s) => (s === 'connecting' ? 'error' : 'ended'));
        }
      });

      await r.connect(tokenResponse.wsUrl, tokenResponse.token);
      await r.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = r;
      setRoom(r);
      setState('live');
    } catch (err) {
      // If a Room was constructed but never reached roomRef (connect or
      // setMicrophoneEnabled threw partway through), dispose it explicitly.
      // teardown() reads roomRef.current and would otherwise leak this one.
      if (pendingRoom && roomRef.current !== pendingRoom) {
        try {
          await pendingRoom.disconnect();
        } catch {
          /* ignore disconnect failures during cleanup */
        }
      }
      await teardown('error');
      const e = err instanceof Error ? err : new Error('Unknown error connecting to session.');
      setError(e);
    } finally {
      inFlightRef.current = false;
    }
  }, [slug, state, teardown]);

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

export { MissingCredentialsError, MintTokenError };
