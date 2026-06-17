'use client';

import { useEffect, useRef, useState } from 'react';
import { RoomEvent } from 'livekit-client';
import { Btn, Grain, ScopeFrame } from '@/components/phosphor';
import type { ScopeFooterCell } from '@/components/phosphor';
import { AgentWaveTrace } from '@/components/playground/AgentWaveTrace';
import { MicDeviceSelect } from '@/components/playground/MicDeviceSelect';
import { SessionTimer } from '@/components/playground/SessionTimer';
import { Transcript } from '@/components/playground/Transcript';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { useDemoSession } from '@/hooks/useDemoSession';
import { RoadNoiseEngine } from '@/lib/audio/road-noise';
import { COLOR } from '@/lib/design/tokens';
import { bandColor, useHealth } from '@/lib/generative-ui/health';
import { MintTokenError } from '@/lib/livekit/mintToken';

/**
 * Left column of the demo page: the SCOPE instrument (oscilloscope screen +
 * control bar + status readouts) and the live TRANSCRIPT panel.
 *
 * Session states drive the scope:
 *
 *   idle / ended / error → no trace, centered "NO SIGNAL" / "SESSION ENDED"
 *                          label, connect / reconnect CTA. Inline error
 *                          banners when 'session.error' is a MintTokenError.
 *   connecting           → a pulsing baseline, disabled controls.
 *   live                 → the amber OscWave trace (dim + slow when the mic is
 *                          muted), disconnect + mic controls, the running
 *                          SessionTimer in the DURATION readout. After 5 s
 *                          with no remote participant, shows the amber
 *                          "agent not connected" hint.
 */

interface VoicePanelProps {
  session: ReturnType<typeof useDemoSession>;
  isReady: boolean;
  slug: string;
}

const AGENT_GRACE_MS = 5000;

export function VoicePanel({ session, isReady, slug }: VoicePanelProps) {
  const { state, connect, disconnect, error, room } = session;
  const [agentMissing, setAgentMissing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [noiseActive, setNoiseActive] = useState(false);
  const noiseRef = useRef<RoadNoiseEngine | null>(null);
  const pendingLevelRef = useRef(0);

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

  // Mute resets to live (unmuted) whenever a fresh session connects.
  useEffect(() => {
    if (state !== 'live') setMuted(false);
  }, [state]);

  // Tear the road-noise engine down when the room goes away.
  useEffect(() => {
    if (room) return;
    const engine = noiseRef.current;
    if (engine) {
      noiseRef.current = null;
      void engine.stop();
      setNoiseActive(false);
      setNoiseLevel(0);
    }
  }, [room]);

  useEffect(() => {
    return () => {
      void noiseRef.current?.stop();
      noiseRef.current = null;
    };
  }, []);

  const toggleMute = () => {
    if (!room) return;
    const next = !muted;
    setMuted(next);
    if (noiseRef.current?.active) {
      noiseRef.current.setMicMuted(next);
    } else {
      void room.localParticipant.setMicrophoneEnabled(!next);
    }
  };

  const onNoiseChange = async (value: number) => {
    setNoiseLevel(value);
    pendingLevelRef.current = value;
    if (!room) return;
    if (!noiseRef.current) {
      const engine = new RoadNoiseEngine();
      noiseRef.current = engine;
      try {
        await engine.start(room);
        setNoiseActive(true);
      } catch {
        noiseRef.current = null;
        return;
      }
    }
    noiseRef.current.setLevel(pendingLevelRef.current / 100);
  };

  const tokenError = error instanceof MintTokenError ? error : null;

  const live = state === 'live';
  const connecting = state === 'connecting';
  const ended = state === 'ended';

  const health = useHealth();
  const waveColor = live && health ? bandColor(health.band) : COLOR.accent;
  const riskCell: ScopeFooterCell =
    live && health
      ? ['RISK', health.risk.toFixed(2), bandColor(health.band)]
      : ['RISK', '··', 'var(--color-text-mute)'];

  const statusText = live
    ? '● LIVE'
    : connecting
      ? '◐ CONNECTING'
      : ended
        ? '○ ENDED'
        : state === 'error'
          ? '○ ERROR'
          : '○ STANDBY';
  const statusColor = live
    ? 'var(--color-live)'
    : connecting
      ? 'var(--color-warning)'
      : state === 'error'
        ? 'var(--color-danger)'
        : 'var(--color-text-mute)';

  return (
    <TooltipProvider delayDuration={150}>
      <aside aria-label="Voice controls" className="flex w-full flex-col gap-4">
        {tokenError ? (
          <div className="rounded-[var(--radius-panel)] border border-[color:color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-3">
            <p className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--color-danger)] uppercase">
              token · rejected
            </p>
            <p className="mt-1 text-[13.5px] text-[color:var(--color-text-dim)]">
              {tokenError.field}: {tokenError.message}
            </p>
          </div>
        ) : null}

        <ScopeFrame
          title={
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{`SCOPE · ${slug}`}</span>
              </TooltipTrigger>
              <TooltipContent>This panel shows the live audio signal.</TooltipContent>
            </Tooltip>
          }
          right={
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help" style={{ color: statusColor }}>
                  {statusText}
                </span>
              </TooltipTrigger>
              <TooltipContent>What the session is doing right now.</TooltipContent>
            </Tooltip>
          }
          footer={[
            ['STATUS', live ? 'listening' : ended ? 'ended' : 'idle', statusColor],
            ['DURATION', <SessionTimer key="dur" state={state} variant="value" />],
            riskCell,
          ]}
        >
          <Grain
            scan
            className="dark relative h-[200px]"
            style={{
              background: 'var(--color-scope)',
              backgroundImage:
                'repeating-linear-gradient(90deg,rgba(244,234,214,0.06) 0 1px,transparent 1px 44px),repeating-linear-gradient(0deg,rgba(244,234,214,0.06) 0 1px,transparent 1px 44px)',
            }}
          >
            <div className="absolute inset-0 flex items-center px-2">
              {live && room ? (
                <AgentWaveTrace color={waveColor} />
              ) : (
                <div
                  className="h-[2px] w-full"
                  style={{
                    background: connecting ? 'var(--color-accent)' : 'var(--color-scope-text-dim)',
                    opacity: connecting ? 1 : 0.4,
                    animation: connecting ? 'ph-pulse 1s infinite' : 'none',
                  }}
                />
              )}
            </div>
            {!live && !connecting ? (
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[12px] tracking-[0.1em] text-[color:var(--color-scope-text-dim)]">
                {ended ? 'SESSION ENDED' : 'NO SIGNAL · PRESS CONNECT'}
              </div>
            ) : null}
          </Grain>

          <div className="flex items-center gap-2.5 border-t border-[color:var(--color-border-dim)] px-[15px] py-[13px]">
            {!live && !connecting ? (
              <Btn kind="primary" onClick={() => void connect()} disabled={!isReady}>
                {ended ? '↻ reconnect' : isReady ? '▶ connect' : '▶ set keys to connect'}
              </Btn>
            ) : (
              <Btn
                kind="ghost"
                onClick={() => void disconnect()}
                disabled={!live}
                className="border-[color:color-mix(in_srgb,var(--color-danger)_40%,transparent)] text-[color:var(--color-danger)] hover:border-[color:var(--color-danger)]"
              >
                {connecting ? '◐ connecting…' : '■ disconnect'}
              </Btn>
            )}
            <button
              type="button"
              onClick={toggleMute}
              disabled={!live}
              className="rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-[14px] py-[10px] font-mono text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: !live
                  ? 'var(--color-text-fade)'
                  : muted
                    ? 'var(--color-warning)'
                    : 'var(--color-text-dim)',
              }}
            >
              {muted ? 'mic off' : 'mic on'}
            </button>
            {live && room && !noiseActive ? <MicDeviceSelect /> : null}
          </div>

          {live && room ? (
            <div className="flex items-center gap-3 border-t border-[color:var(--color-border-dim)] px-[15px] py-[11px]">
              <span className="font-mono text-[11px] tracking-[0.08em] whitespace-nowrap text-[color:var(--color-text-mute)] uppercase">
                road noise
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={noiseLevel}
                onChange={(e) => void onNoiseChange(Number(e.target.value))}
                aria-label="Road noise level"
                className="h-1 flex-1 cursor-pointer"
                style={{ accentColor: 'var(--color-accent)' }}
              />
              <span className="w-7 text-right font-mono text-[11px] text-[color:var(--color-text-dim)] tabular-nums">
                {noiseLevel}
              </span>
            </div>
          ) : null}
        </ScopeFrame>

        {agentMissing ? (
          <div className="rounded-[var(--radius-panel)] border border-[color:color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-3">
            <p className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--color-warning)] uppercase">
              agent · not connected
            </p>
            <p className="mt-1 text-[13.5px] leading-[1.5] text-[color:var(--color-text-dim)]">
              Run{' '}
              <code className="font-mono text-[12.5px] text-[color:var(--color-accent-dim)]">
                uv run python agent.py dev
              </code>{' '}
              in the cookbook to bring the agent online.
            </p>
          </div>
        ) : null}

        <ScopeFrame title="TRANSCRIPT" bodyClassName="p-4">
          {room ? (
            <Transcript defaultOpen />
          ) : (
            <p className="px-1 py-6 text-center font-mono text-[12px] text-[color:var(--color-text-mute)]">
              {connecting ? 'establishing channel…' : 'transcript will stream here'}
            </p>
          )}
        </ScopeFrame>
      </aside>
    </TooltipProvider>
  );
}
