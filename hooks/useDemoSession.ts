'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { type CredentialMap, getCredentials } from '@/lib/credentials/store';
import type { RejectionDetail } from '@/lib/credentials/types';
import { missingCredentials } from '@/lib/credentials/validate';
import { MintTokenError, mintToken } from '@/lib/livekit/mintToken';

export type SessionState = 'idle' | 'connecting' | 'live' | 'ended' | 'error';

export interface UseDemoSessionOptions {
  slug: string;
  requiredCredentials: readonly string[];
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

/**
 * Returns the non-LiveKit credentials as a string map, suitable for
 * 'localParticipant.setAttributes'. The agent worker (F1.3) reads these to
 * configure its STT/LLM/TTS clients without needing its own .env.
 */
function extractAgentAttributes(creds: CredentialMap): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(creds)) {
    if (key.startsWith('livekit_')) continue;
    if (!value || value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

export function useDemoSession({
  slug,
  requiredCredentials,
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
      const tokenResponse = await mintToken({
        livekit_url: creds.livekit_url,
        livekit_api_key: creds.livekit_api_key,
        livekit_api_secret: creds.livekit_api_secret,
        slug,
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

      const agentAttributes = extractAgentAttributes(creds);
      if (Object.keys(agentAttributes).length > 0) {
        try {
          await r.localParticipant.setAttributes(agentAttributes);
        } catch {
          /* attribute publish is advisory: the agent template falls back to .env */
        }
      }

      await r.localParticipant.setMicrophoneEnabled(true);

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
  }, [slug, requiredCredentials, state, teardown]);

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
