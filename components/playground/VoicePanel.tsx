'use client';

import { useEffect, useState } from 'react';
import { RoomEvent } from 'livekit-client';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { SessionTimer } from '@/components/playground/SessionTimer';
import { Transcript } from '@/components/playground/Transcript';
import type { useDemoSession } from '@/hooks/useDemoSession';
import { MintTokenError } from '@/lib/livekit/mintToken';

/**
 * Left column of the demo page. Owns the per-session controls (talk, end,
 * retry) and the live feedback channels (audio level visualizer, transcript,
 * session timer).
 *
 * Three visual states drive the layout:
 *
 *   idle / ended / error → Talk / "Try again" CTA, no audio viz, no
 *                          transcript. Inline error banners when the
 *                          session.error is a MintTokenError.
 *   connecting           → "connecting…" disabled CTA + spinner-style dots.
 *   live                 → End button, animated audio visualizer, live
 *                          transcript, mm:ss session timer. After 5 s with
 *                          no remote participant, shows the amber
 *                          "Agent not connected" hint.
 */

interface VoicePanelProps {
  session: ReturnType<typeof useDemoSession>;
  isReady: boolean;
}

const AGENT_GRACE_MS = 5000;

export function VoicePanel({ session, isReady }: VoicePanelProps) {
  const { state, connect, disconnect, error, room } = session;
  const [agentMissing, setAgentMissing] = useState(false);

  useEffect(() => {
    if (state !== 'live' || !room) {
      setAgentMissing(false);
      return;
    }
    if (room.remoteParticipants.size > 0) {
      setAgentMissing(false);
      return;
    }
    const t = setTimeout(() => {
      if (room.remoteParticipants.size === 0) setAgentMissing(true);
    }, AGENT_GRACE_MS);
    const onJoin = () => {
      setAgentMissing(false);
      clearTimeout(t);
    };
    room.on(RoomEvent.ParticipantConnected, onJoin);
    return () => {
      clearTimeout(t);
      room.off(RoomEvent.ParticipantConnected, onJoin);
    };
  }, [state, room]);

  const tokenError = error instanceof MintTokenError ? error : null;

  return (
    <aside
      aria-label="Voice controls"
      className="flex w-full flex-col gap-3 rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 md:w-[320px]"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {'// VOICE'}
        </span>
        <SessionTimer state={state} />
      </div>

      {tokenError ? (
        <div className="rounded-[var(--radius-input)] border border-[color:var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] p-3">
          <p className="font-mono text-[10px] tracking-[0.06em] text-[color:var(--color-danger)] uppercase">
            {'// TOKEN · REJECTED'}
          </p>
          <p className="mt-1 text-[12.5px] text-[color:var(--color-text-dim)]">
            {tokenError.field}: {tokenError.message}
          </p>
        </div>
      ) : null}

      {state === 'live' || state === 'connecting' ? (
        <button
          type="button"
          onClick={() => void disconnect()}
          disabled={state !== 'live'}
          className="rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-4 py-2 text-[13px] text-[color:var(--color-text)] hover:border-[color:var(--color-border-strong)] disabled:cursor-not-allowed disabled:text-[color:var(--color-text-fade)]"
        >
          {state === 'connecting' ? 'connecting…' : 'End'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void connect()}
          disabled={!isReady}
          className="rounded-[var(--radius-button)] bg-[color:var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-[color:var(--color-bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-surface-2)] disabled:text-[color:var(--color-text-fade)]"
        >
          {state === 'idle'
            ? isReady
              ? '→ Talk'
              : 'Set keys to talk'
            : state === 'ended'
              ? '→ Try again'
              : '→ Retry'}
        </button>
      )}

      <div className="rounded-[var(--radius-input)] border border-[color:var(--color-border-dim)] bg-[color:var(--color-surface-2)] p-3">
        <AgentAudioVisualizerBar
          size="md"
          state={
            state === 'live' ? 'listening' : state === 'connecting' ? 'connecting' : 'disconnected'
          }
          color="#2DD4BF"
        />
      </div>

      {agentMissing ? (
        <div className="rounded-[var(--radius-input)] border border-[color:var(--color-warning)] bg-[color:color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-3">
          <p className="font-mono text-[10px] tracking-[0.06em] text-[color:var(--color-warning)] uppercase">
            {'// AGENT · NOT CONNECTED'}
          </p>
          <p className="mt-1 text-[12px] leading-[1.5] text-[color:var(--color-text-dim)]">
            Run{' '}
            <code className="font-mono text-[11px] text-[color:var(--color-accent)]">
              uv run python agent.py dev
            </code>{' '}
            in the cookbook to bring the agent online.
          </p>
        </div>
      ) : null}

      {state === 'live' || state === 'ended' ? (
        <div className="flex-1 overflow-hidden">
          <Transcript defaultOpen />
        </div>
      ) : null}
    </aside>
  );
}
