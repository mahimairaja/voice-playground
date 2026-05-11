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

const STACK_LABEL = 'stack · DG · 4o · CART';

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
  return (
    <div className={cn('relative', className)}>
      <div
        className="bg-paper flex min-h-[280px] flex-col items-center justify-center gap-6 px-6 py-8"
        style={{ border: '1.5px solid var(--ink)', borderRadius: 4 }}
      >
        {children}
      </div>
      {stamp && (
        <span
          className="stamp"
          style={
            stamp === 'LIVE'
              ? {
                  borderColor: 'var(--vg-green)',
                  color: 'var(--paper)',
                  background: 'var(--vg-green)',
                }
              : undefined
          }
        >
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
    <>
      <div className="text-center">
        <p className="tiny-mono">{`// session · ${state}`}</p>
        {state === 'idle' && keysReady && (
          <p
            className="tiny-mono mt-1"
            style={{ color: 'var(--vg-green)', letterSpacing: '0.14em' }}
          >
            · ready · provider keys ok
          </p>
        )}
        <p className="h-hand xl mt-2">
          {state === 'ended'
            ? 'Call ended.'
            : state === 'error'
              ? 'Could not connect.'
              : 'Ready to talk.'}
        </p>
        <p className="p-hand sm mt-3 max-w-md">
          {state === 'error' && error
            ? error.message
            : 'Press the call button. Make sure your provider keys are saved first.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onConnect}
        className="btn accent brand-accent cursor-pointer"
        aria-label="Start session"
      >
        {state === 'ended' ? 'Call again →' : state === 'error' ? 'Try again →' : 'Start call →'}
      </button>
    </>
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

  // Match the bar visualizer color to brand accent in both themes.
  const barColor = '#c46a3a';

  useEffect(() => {
    /* presence here keeps voice in lexical scope so future enhancements
       (reactive UI from voice.state, voice.agent metadata) have a hook */
  }, [voice.state]);

  return (
    <>
      <div className="flex h-full w-full flex-col items-center gap-4">
        <p className="tiny-mono">{`· ${STACK_LABEL}`}</p>
        <AgentAudioVisualizerBar
          size="lg"
          state={voice.state}
          color={barColor}
          audioTrack={agentTrack}
          className="w-full"
        />
        <p className="tiny-mono">{`// agent · ${voice.state}`}</p>
      </div>
      <div className="flex w-full max-w-md flex-col items-center gap-3">
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
      <Transcript className="w-full max-w-2xl" />
    </>
  );
}
