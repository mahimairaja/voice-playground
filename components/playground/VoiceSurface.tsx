'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room } from 'livekit-client';
import { RoomAudioRenderer, RoomContext, useVoiceAssistant } from '@livekit/components-react';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { AgentControlBar } from '@/components/agents-ui/agent-control-bar';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { Transcript } from '@/components/playground/Transcript';
import { useDemoSession } from '@/hooks/useDemoSession';
import { CRED_CHANGE_EVENT, CRED_PREFIX } from '@/lib/credentials/store';
import { missingCredentials } from '@/lib/credentials/validate';
import { useUiDispatcher } from '@/lib/generative-ui/dispatcher';
import { cn } from '@/lib/shadcn/utils';

const STACK_ROWS: { kind: string; provider: string }[] = [
  { kind: 'stt', provider: 'deepgram nova-2' },
  { kind: 'llm', provider: 'openai gpt-4o' },
  { kind: 'tts', provider: 'cartesia sonic' },
];

interface VoiceSurfaceProps {
  slug: string;
  requiredCredentials: readonly string[];
  className?: string;
}

export function VoiceSurface({ slug, requiredCredentials, className }: VoiceSurfaceProps) {
  const session = useDemoSession({ slug, requiredCredentials });
  const { state, room, error, connect, disconnect } = session;
  const keysReady = useKeysReady(requiredCredentials);

  if (state === 'live' || state === 'connecting') {
    if (!room) {
      return <SurfaceShell stamp="CONNECTING" className={className} />;
    }
    return (
      <RoomContext.Provider value={room}>
        <RoomAudioRenderer />
        <DispatcherBinding room={room} />
        <SurfaceShell stamp={state === 'live' ? 'LIVE' : 'CONNECTING'} className={className}>
          <LiveBody onDisconnect={disconnect} />
        </SurfaceShell>
      </RoomContext.Provider>
    );
  }

  return (
    <SurfaceShell stamp={state === 'error' ? 'ERROR' : null} className={className}>
      <IdleBody state={state} error={error} onConnect={connect} keysReady={keysReady} />
    </SurfaceShell>
  );
}

function useKeysReady(requiredCredentials: readonly string[]): boolean {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith(CRED_PREFIX)) setTick((t) => t + 1);
    };
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener('storage', onStorage);
    window.addEventListener(CRED_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CRED_CHANGE_EVENT, onChange);
    };
  }, []);
  return useMemo(
    () => requiredCredentials.length > 0 && missingCredentials(requiredCredentials).length === 0,
    // tick re-evaluates on storage / cred-change events
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requiredCredentials, tick]
  );
}

interface SurfaceShellProps {
  stamp: 'CONNECTING' | 'LIVE' | 'ERROR' | null;
  className?: string;
  children?: React.ReactNode;
}

function SurfaceShell({ stamp, className, children }: SurfaceShellProps) {
  const stampStyle =
    stamp === 'LIVE'
      ? {
          borderColor: 'var(--vg-green)',
          color: 'var(--paper)',
          background: 'var(--vg-green)',
        }
      : undefined;

  return (
    <div className={cn('relative', className)}>
      <div
        className="bg-paper flex min-h-[280px] flex-col gap-4 px-5 py-5"
        style={{ border: '1.5px solid var(--ink)', borderRadius: 4 }}
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <p className="tiny-mono">· vitals · {stamp ? stamp.toLowerCase() : 'idle'}</p>
          {stamp === 'LIVE' ? (
            <span
              className="chip"
              style={{
                background: 'var(--vg-green)',
                color: 'var(--paper)',
                borderColor: 'var(--vg-green)',
              }}
            >
              ● healthy
            </span>
          ) : stamp === 'CONNECTING' ? (
            <span className="chip">connecting…</span>
          ) : stamp === 'ERROR' ? (
            <span className="chip" style={{ background: 'var(--accent-soft-hex)' }}>
              ! error
            </span>
          ) : (
            <span className="chip">idle</span>
          )}
        </header>
        {children}
      </div>
      {stamp && (
        <span className="stamp" style={stampStyle}>
          {stamp === 'LIVE' ? 'LIVE · ●' : stamp === 'CONNECTING' ? 'CONNECTING' : 'ERROR'}
        </span>
      )}
    </div>
  );
}

interface IdleBodyProps {
  state: 'idle' | 'ended' | 'error';
  error: Error | null;
  onConnect: () => void;
  keysReady: boolean;
}

function IdleBody({ state, error, onConnect, keysReady }: IdleBodyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h3
        style={{
          fontFamily: 'var(--hand-title)',
          fontWeight: 700,
          fontSize: 28,
          lineHeight: 1.05,
        }}
      >
        {state === 'ended'
          ? 'call ended.'
          : state === 'error'
            ? "couldn't connect."
            : 'the call, alive.'}
      </h3>
      <EkgStrip kind={state === 'idle' ? 'flat' : state === 'error' ? 'jagged' : 'flat'} />
      <p className="p-hand sm max-w-md">
        {state === 'error' && error
          ? error.message
          : state === 'idle' && keysReady
            ? 'Press the call button. Tokens are minted in your browser.'
            : 'Save provider keys first, then start a call.'}
      </p>
      {state === 'idle' && keysReady && (
        <p className="tiny-mono" style={{ color: 'var(--vg-green)', letterSpacing: '0.14em' }}>
          · ready · provider keys ok
        </p>
      )}
      <button
        type="button"
        onClick={onConnect}
        className="btn accent brand-accent cursor-pointer"
        aria-label="Start session"
      >
        {state === 'ended' ? 'call again →' : state === 'error' ? 'try again →' : 'start call →'}
      </button>
    </div>
  );
}

function DispatcherBinding({ room }: { room: Room }) {
  useUiDispatcher(room);
  return null;
}

interface LiveBodyProps {
  onDisconnect: () => Promise<void>;
}

function LiveBody({ onDisconnect }: LiveBodyProps) {
  const voice = useVoiceAssistant();
  const agentTrack = voice.audioTrack;
  const barColor = '#c46a3a';

  useEffect(() => {
    /* keep voice.state in scope for future reactive enhancements */
  }, [voice.state]);

  return (
    <>
      <div
        className="relative flex w-full flex-col gap-2"
        style={{
          background: 'var(--paper-2)',
          border: '1.5px solid var(--ink)',
          borderRadius: 6,
          padding: '10px 12px',
        }}
      >
        <p className="tiny-mono">voice · ekg</p>
        <AgentAudioVisualizerBar
          size="lg"
          state={voice.state}
          color={barColor}
          audioTrack={agentTrack}
          className="w-full"
        />
        <p className="tiny-mono" style={{ color: 'var(--vg-green)' }}>
          · 72 turns/min · stable
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="box" style={{ padding: 10, background: 'var(--paper-2)', borderRadius: 6 }}>
          <p className="tiny-mono">· stack</p>
          <ul
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              lineHeight: 1.55,
              marginTop: 2,
            }}
          >
            {STACK_ROWS.map((row) => (
              <li key={row.kind}>
                {row.kind} · {row.provider}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="box brand-accent"
          style={{
            padding: 10,
            background: 'var(--vg-green-soft)',
            borderRadius: 6,
            minWidth: 110,
          }}
        >
          <p className="tiny-mono">· latency</p>
          <p
            style={{
              fontFamily: 'var(--hand-title)',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--vg-green)',
              marginTop: 2,
            }}
          >
            live
          </p>
          <p className="tiny-mono" style={{ marginTop: -2 }}>
            target &lt;800ms
          </p>
        </div>
      </div>

      <p className="tiny-mono">{`// agent · ${voice.state}`}</p>

      <div className="flex w-full flex-col items-center gap-3">
        <AgentControlBar
          variant="default"
          controls={{
            leave: true,
            microphone: true,
            chat: false,
            camera: false,
            screenShare: false,
          }}
          isConnected
          onDisconnect={() => {
            void onDisconnect();
          }}
          className="w-full"
        />
        <StartAudioButton size="sm" variant="ghost" label="Click to allow audio playback" />
      </div>

      <Transcript className="w-full" />
    </>
  );
}

interface EkgStripProps {
  kind: 'flat' | 'jagged';
}

function EkgStrip({ kind }: EkgStripProps) {
  const path =
    kind === 'jagged'
      ? 'M0 24 L40 24 L48 8 L56 40 L64 24 L120 24 L128 14 L136 36 L144 24 L240 24'
      : 'M0 24 L80 24 L88 14 L96 34 L104 24 L160 24 L168 16 L176 32 L184 24 L240 24';
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden"
      style={{
        height: 48,
        background: 'var(--paper-2)',
        border: '1px solid var(--line-soft)',
        borderRadius: 4,
      }}
    >
      <svg
        viewBox="0 0 240 48"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <path
          d={path}
          stroke="var(--vg-green)"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
