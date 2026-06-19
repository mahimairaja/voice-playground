'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { Mic } from 'lucide-react';
import { RoomAudioRenderer, RoomContext } from '@livekit/components-react';
import { CallView } from '@/components/playground/call/CallView';
import { type JoinCreds, parseFragment } from '@/components/playground/call/links';
import { useUiDispatcher } from '@/lib/generative-ui/dispatcher';
import { UI_REQUEST_TOPIC } from '@/lib/generative-ui/protocol';

/**
 * Guest side of the front-desk interpreter call. A host on the demo page mints a
 * guest token for their live room and shares a '/join#u=<wsUrl>&t=<token>' link;
 * the token rides the fragment, so it never reaches a server. This page parses
 * it, connects (mic + camera), and renders the shared CallView. Connecting is
 * gated behind a click because browsers block media capture and audio playback
 * until a user gesture.
 */

const SLUG = 'front-desk-interpreter';

type JoinState = 'parsing' | 'ready' | 'connecting' | 'live' | 'ended' | 'error';

/**
 * Binds the dispatcher to the room (captions, scene) and, once that listener is
 * attached, asks the agent to replay the current UI. The agent's own join-time
 * replay would race this listener (it only attaches after we finish connecting
 * media), so this request is what reliably populates the guest's captions.
 */
function CaptionBridge({ room }: { room: Room }) {
  useUiDispatcher(room, SLUG);
  useEffect(() => {
    const payload = new TextEncoder().encode(JSON.stringify({ type: 'ui_request' }));
    void room.localParticipant
      .publishData(payload, { reliable: true, topic: UI_REQUEST_TOPIC })
      .catch(() => {
        /* best effort; nothing actionable if the request fails to send */
      });
  }, [room]);
  return null;
}

export default function JoinPage() {
  const [state, setState] = useState<JoinState>('parsing');
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const credsRef = useRef<JoinCreds | null>(null);
  const roomRef = useRef<Room | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const creds = parseFragment(window.location.hash);
    credsRef.current = creds;
    setState(creds ? 'ready' : 'error');
    if (!creds) {
      setError('This join link is missing its connection details. Ask the host for a fresh one.');
    }
  }, []);

  useEffect(() => {
    return () => {
      const r = roomRef.current;
      roomRef.current = null;
      if (r) r.disconnect().catch(() => {});
    };
  }, []);

  const join = useCallback(async () => {
    const creds = credsRef.current;
    if (!creds || inFlightRef.current || state === 'live' || state === 'connecting') return;
    inFlightRef.current = true;
    setError(null);
    setState('connecting');

    let pending: Room | null = null;
    try {
      const r = new Room();
      pending = r;
      r.on(RoomEvent.Disconnected, () => {
        if (roomRef.current === r) {
          roomRef.current = null;
          setRoom(null);
          setState((s) => (s === 'connecting' ? 'error' : 'ended'));
        }
      });

      await r.connect(creds.wsUrl, creds.token);
      await r.localParticipant.setMicrophoneEnabled(true);
      // Camera is best-effort: a failure leaves the guest on the call with audio.
      try {
        await r.localParticipant.setCameraEnabled(true);
      } catch {
        /* audio-only fallback */
      }

      roomRef.current = r;
      setRoom(r);
      setState('live');
    } catch (err) {
      if (pending && roomRef.current !== pending) {
        try {
          await pending.disconnect();
        } catch {
          /* ignore cleanup failure */
        }
      }
      setRoom(null);
      setState('error');
      setError(err instanceof Error ? err.message : 'Could not connect to the call.');
    } finally {
      inFlightRef.current = false;
    }
  }, [state]);

  const leave = useCallback(async () => {
    const r = roomRef.current;
    roomRef.current = null;
    setRoom(null);
    if (r) {
      try {
        await r.disconnect();
      } catch {
        /* ignore */
      }
    }
    setState('ended');
  }, []);

  if (room && state === 'live') {
    return (
      <RoomContext.Provider value={room}>
        <RoomAudioRenderer />
        <CaptionBridge room={room} />
        <div className="mx-auto w-full max-w-[760px] px-6 py-8">
          <CallView room={room} role="guest" slug={SLUG} onLeave={leave} />
        </div>
      </RoomContext.Provider>
    );
  }

  const canJoin = state === 'ready' || state === 'ended' || (state === 'error' && credsRef.current);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[460px] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div>
        <p className="font-mono text-[12px] tracking-[0.08em] text-[color:var(--color-text-mute)] uppercase">
          interpreter call
        </p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
          Join the call
        </h1>
        <p className="mt-2 text-[14px] leading-[1.55] text-[color:var(--color-text-dim)]">
          You are joining a live interpreter video call. Speak any language; the interpreter relays
          it to the other side and reads their reply back to you. Use headphones to keep the two
          sides from echoing.
        </p>
      </div>

      {canJoin ? (
        <button
          type="button"
          onClick={join}
          className="flex items-center gap-2 rounded-[var(--radius-input)] border border-[color:var(--color-accent-dim)] bg-[color:color-mix(in_srgb,var(--color-accent)_14%,transparent)] px-5 py-2.5 font-mono text-[13px] tracking-[0.04em] text-[color:var(--color-accent-dim)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-accent)_22%,transparent)]"
        >
          <Mic size={16} />
          {state === 'ended' ? 'rejoin the call' : 'join the call'}
        </button>
      ) : null}

      {state === 'connecting' ? (
        <p className="font-mono text-[12px] tracking-[0.04em] text-[color:var(--color-text-dim)]">
          connecting…
        </p>
      ) : null}

      {error ? (
        <p className="font-mono text-[12px] leading-[1.5] text-[color:var(--color-warning)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
