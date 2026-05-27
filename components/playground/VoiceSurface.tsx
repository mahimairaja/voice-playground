'use client';

import { type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import {
  RoomAudioRenderer,
  RoomContext,
  useLocalParticipant,
  useVoiceAssistant,
} from '@livekit/components-react';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { Transcript } from '@/components/playground/Transcript';
import { type SessionState, useDemoSession } from '@/hooks/useDemoSession';
import { type LoadedDemoManifest } from '@/lib/demos';
import { type DemoSurface, parseRoomSurfaceMetadata } from '@/lib/demos/surface';
import { useUiDispatcher, useUiStore } from '@/lib/generative-ui/dispatcher';
import { resolve } from '@/lib/generative-ui/registry';
import { cn } from '@/lib/shadcn/utils';

interface VoiceSurfaceProps {
  demo: LoadedDemoManifest;
  requiredCredentials: readonly string[];
  surface: DemoSurface;
  onSurfaceChange: (surface: DemoSurface) => void;
}

export function VoiceSurface({
  demo,
  requiredCredentials,
  surface,
  onSurfaceChange,
}: VoiceSurfaceProps) {
  const session = useDemoSession({ slug: demo.slug, requiredCredentials });
  const { state, room, error, connect, disconnect } = session;

  const connectFresh = useCallback(async () => {
    useUiStore.getState().clear();
    await connect();
  }, [connect]);

  const content = (
    <ReferenceSurface
      demo={demo}
      surface={surface}
      state={state}
      error={error}
      hasRoom={Boolean(room)}
      onConnect={connectFresh}
      onDisconnect={disconnect}
    />
  );

  if ((state === 'live' || state === 'connecting') && room) {
    return (
      <RoomContext.Provider value={room}>
        <RoomAudioRenderer />
        <DispatcherBinding room={room} slug={demo.slug} />
        <RoomMetadataBinding room={room} onSurfaceChange={onSurfaceChange} />
        {content}
      </RoomContext.Provider>
    );
  }

  return content;
}

function DispatcherBinding({ room, slug }: { room: Room; slug: string }) {
  useUiDispatcher(room, slug);
  return null;
}

function RoomMetadataBinding({
  room,
  onSurfaceChange,
}: {
  room: Room;
  onSurfaceChange: (surface: DemoSurface) => void;
}) {
  useEffect(() => {
    const apply = (metadata: string | undefined) => {
      const next = parseRoomSurfaceMetadata(metadata);
      if (next) onSurfaceChange(next);
    };

    apply(room.metadata);
    const onMetadata = (metadata: string) => apply(metadata);
    room.on(RoomEvent.RoomMetadataChanged, onMetadata);
    return () => {
      room.off(RoomEvent.RoomMetadataChanged, onMetadata);
    };
  }, [room, onSurfaceChange]);

  return null;
}

interface ReferenceSurfaceProps {
  demo: LoadedDemoManifest;
  surface: DemoSurface;
  state: SessionState;
  error: Error | null;
  hasRoom: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

function ReferenceSurface(props: ReferenceSurfaceProps) {
  if (props.surface === 'vitals_monitor') return <VitalsMonitorSurface {...props} />;
  if (props.surface === 'whiteboard') return <WhiteboardSurface {...props} />;
  return <ClipboardWalkieSurface {...props} />;
}

function ClipboardWalkieSurface({
  demo,
  state,
  error,
  hasRoom,
  onConnect,
  onDisconnect,
}: ReferenceSurfaceProps) {
  return (
    <main
      className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28"
      data-demo-surface="clipboard_walkie"
    >
      <section className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.45fr)]">
        <div
          className="relative"
          style={{
            background: 'var(--paper-2)',
            border: '1.5px solid var(--ink)',
            borderRadius: '16px 18px 15px 17px',
            boxShadow: '4px 4px 0 var(--ink)',
            padding: 14,
          }}
        >
          <WalkieAntenna />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="tiny-mono">· CONCIERGE 01</p>
              <h1 className="h-hand xl mt-1">maple house RE</h1>
            </div>
            <span className="chip accent brand-accent">●</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <DemoControls
              state={state}
              hasRoom={hasRoom}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          </div>

          <div className="mt-4 rounded-sm border border-[var(--ink)] bg-[var(--paper)] p-3">
            <p className="tiny-mono">· 02:14 ON-AIR</p>
            <ReferenceTranscript hasRoom={hasRoom} />
          </div>

          <SessionNote state={state} error={error} />
        </div>

        <div
          className="relative"
          style={{
            background: 'var(--paper)',
            border: '1.5px solid var(--ink)',
            borderRadius: '10px 12px 9px 11px',
            boxShadow: '4px 4px 0 var(--ink)',
            padding: 18,
          }}
        >
          <ClipboardClip />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="tiny-mono">· LISTING · 41 BLOOR W</p>
              <h2 className="h-hand xl mt-1">queen west loft · $740k</h2>
            </div>
            <span className="chip">3rd showing</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {['floorplan', '2 bed · 1 bath', '820 sqft', 'parking incl.'].map((item) => (
              <div key={item} className="box hatch" style={{ padding: 10 }}>
                <p className="tiny-mono">{item}</p>
              </div>
            ))}
          </div>

          <section className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="tiny-mono">· AGENT MOUNTED ↓</p>
              <p className="tiny-mono">← mounted 0:42</p>
            </div>
            <DynamicAgentSlot slug={demo.slug} fallback={<ReferenceMountedListing />} />
          </section>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.8fr]">
            <div className="box dashed" style={{ padding: 12 }}>
              <p className="tiny-mono">SIMILAR · 2 NEARBY</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <MiniCard title="parkdale" stat="$695k" />
                <MiniCard title="leslieville" stat="$780k" />
              </div>
            </div>
            <div className="box" style={{ background: 'var(--paper-2)', padding: 12 }}>
              <p className="tiny-mono">· BOOK A VIEWING</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn">
                  thu 4p
                </button>
                <button type="button" className="btn accent brand-accent">
                  sat 11a
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="tiny-mono mt-8">· MAPLE HOUSE RE · LISTING queen west · $740k plan · TALK</p>
    </main>
  );
}

function VitalsMonitorSurface({
  demo,
  state,
  error,
  hasRoom,
  onConnect,
  onDisconnect,
}: ReferenceSurfaceProps) {
  return (
    <main
      className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28"
      data-demo-surface="vitals_monitor"
    >
      <section
        style={{
          background: 'var(--paper)',
          border: '1.5px solid var(--ink)',
          borderRadius: '10px 12px 9px 11px',
          boxShadow: '4px 4px 0 var(--ink)',
          padding: 20,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="tiny-mono">· VITALS · CONCIERGE</p>
            <h1 className="h-hand xxl mt-1 leading-[0.95]">the call, alive.</h1>
          </div>
          <span className="chip accent brand-accent">● HEALTHY</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[1.25fr_0.75fr]">
          <div
            style={{
              background: 'var(--paper-2)',
              backgroundImage:
                'linear-gradient(rgba(45,122,79,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(45,122,79,0.07) 1px, transparent 1px)',
              backgroundSize: '18px 18px, 18px 18px',
              border: '1.5px solid var(--ink)',
              borderRadius: 6,
              minHeight: 280,
              padding: 16,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="tiny-mono">VOICE · EKG</p>
              <p className="tiny-mono" style={{ color: 'var(--vg-green)' }}>
                72 BPM · STABLE
              </p>
            </div>
            <div className="mt-8">{hasRoom ? <LiveEkg /> : <StaticEkg />}</div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="box" style={{ background: 'var(--vg-green-soft)', padding: 14 }}>
              <p className="tiny-mono">· LATENCY</p>
              <p className="h-hand xxl mt-1" style={{ color: 'var(--vg-green)' }}>
                540ms
              </p>
              <p className="tiny-mono">p50 last 10s</p>
            </div>
            <div className="box" style={{ padding: 14 }}>
              <p className="tiny-mono">· STACK</p>
              <StackRows />
            </div>
            <div className="box dashed" style={{ padding: 14 }}>
              <p className="tiny-mono">· SURFACE</p>
              <p className="p-hand sm mt-2">{demo.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <DemoControls
                state={state}
                hasRoom={hasRoom}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            </div>
          </aside>
        </div>

        <SessionNote state={state} error={error} />
      </section>
      <p className="tiny-mono mt-8">· VITALS healthy. p50</p>
    </main>
  );
}

function WhiteboardSurface({
  demo,
  state,
  error,
  hasRoom,
  onConnect,
  onDisconnect,
}: ReferenceSurfaceProps) {
  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28" data-demo-surface="whiteboard">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)]">
        <div
          style={{
            background: 'var(--paper-2)',
            border: '1.5px solid var(--ink)',
            borderRadius: '10px 12px 9px 11px',
            boxShadow: '4px 4px 0 var(--ink)',
            minHeight: 520,
            padding: 18,
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="tiny-mono">· WHITEBOARD</p>
              <h1 className="h-hand xxl mt-1 leading-[0.95]">the agent writes here.</h1>
            </div>
            <span className="chip accent brand-accent">● live</span>
          </div>

          <div className="mt-6 rounded-sm border border-[var(--ink)] bg-[var(--paper)] p-4">
            <p className="tiny-mono">· DRAWN BY AGENT</p>
            <DynamicAgentSlot slug={demo.slug} fallback={<ReferenceShortlist />} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.7fr]">
            <div className="box" style={{ padding: 12 }}>
              <p className="tiny-mono">· NEXT</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['book viewing', 'send PDFs', 'compare'].map((action) => (
                  <button key={action} type="button" className="btn">
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <div className="box dashed" style={{ padding: 12 }}>
              <p className="p-hand sm">↑ eraser = clear canvas</p>
            </div>
          </div>
        </div>

        <aside
          style={{
            background: 'var(--paper)',
            border: '1.5px solid var(--ink)',
            borderRadius: '16px 18px 15px 17px',
            boxShadow: '4px 4px 0 var(--ink)',
            padding: 14,
          }}
        >
          <p className="tiny-mono">· YOU</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <DemoControls
              state={state}
              hasRoom={hasRoom}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          </div>
          <div className="line soft my-4"></div>
          <ReferenceTranscript hasRoom={hasRoom} />
          <SessionNote state={state} error={error} />
        </aside>
      </section>
    </main>
  );
}

function DemoControls({
  state,
  hasRoom,
  onConnect,
  onDisconnect,
}: {
  state: SessionState;
  hasRoom: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}) {
  const busy = state === 'connecting';

  return (
    <>
      {hasRoom ? (
        <LiveMuteButton />
      ) : (
        <button
          type="button"
          className="btn accent brand-accent cursor-pointer"
          disabled={busy}
          onClick={() => {
            void onConnect();
          }}
        >
          {busy ? 'dialing' : 'talk'}
        </button>
      )}
      <button
        type="button"
        className={cn('btn cursor-pointer', hasRoom && 'accent brand-accent')}
        disabled={!hasRoom && !busy}
        onClick={() => {
          void onDisconnect();
        }}
      >
        ● end
      </button>
    </>
  );
}

function LiveMuteButton() {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  return (
    <button
      type="button"
      className="btn cursor-pointer"
      onClick={() => {
        void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      }}
    >
      {isMicrophoneEnabled ? 'mute' : 'unmute'}
    </button>
  );
}

function ReferenceTranscript({ hasRoom }: { hasRoom: boolean }) {
  if (hasRoom) return <Transcript defaultOpen className="mt-3" />;

  return (
    <div className="mt-3">
      <p className="tiny-mono">· TRANSCRIPT</p>
      <div className="mt-3 flex flex-col gap-3">
        <TranscriptLine who="YOU" text="can I see the floorplan?" />
        <TranscriptLine who="AGENT" text="I found the queen west loft and two similar homes." />
        <TranscriptLine who="LIVE" text="shortlist ready." />
      </div>
    </div>
  );
}

function TranscriptLine({ who, text }: { who: string; text: string }) {
  return (
    <div className="rounded-sm border border-[var(--line-soft)] bg-[var(--paper-2)] px-3 py-2">
      <p className="tiny-mono">{who}</p>
      <p className="p-hand sm mt-1">{text}</p>
    </div>
  );
}

function SessionNote({ state, error }: { state: SessionState; error: Error | null }) {
  if (state === 'idle' || state === 'live') return null;

  const text =
    state === 'connecting'
      ? 'dialing the LiveKit room.'
      : state === 'ended'
        ? 'call ended. talk to start again.'
        : (error?.message ?? 'connection failed.');

  return (
    <p
      className="p-hand sm mt-4"
      style={{ color: state === 'error' ? 'var(--accent-hex)' : 'var(--ink-soft)' }}
    >
      {text}
    </p>
  );
}

function DynamicAgentSlot({ slug, fallback }: { slug: string; fallback: ReactNode }) {
  const instanceMap = useUiStore((state) => state.instances);
  const instances = useMemo(
    () => Object.values(instanceMap).sort((a, b) => a.mountedAt - b.mountedAt),
    [instanceMap]
  );
  const rendered = instances
    .map((instance) => {
      const Component = resolve(slug, instance.component);
      if (!Component) return null;
      return (
        <Component
          key={instance.id}
          {...instance.props}
          data-instance-id={instance.id}
          data-instance-mounted-at={instance.mountedAt}
        />
      );
    })
    .filter(Boolean);

  if (rendered.length === 0) return <>{fallback}</>;

  return <div className="mt-3 flex flex-col gap-3">{rendered}</div>;
}

function ReferenceMountedListing() {
  return (
    <div className="box hatch mt-3" style={{ padding: 14 }}>
      <p className="h-hand xl">mtgs avail</p>
      <p className="p-hand sm mt-2">
        agent mounted a listing panel with viewing slots, floorplan, and nearby comparables.
      </p>
    </div>
  );
}

function ReferenceShortlist() {
  return (
    <div className="mt-4">
      <h2 className="h-hand xl">your shortlist</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <WhiteboardCard label="floor" title="queen w · $740k" />
        <WhiteboardCard label="A" title="parkdale · $695k" />
        <WhiteboardCard label="B" title="leslieville · $780k" />
      </div>
    </div>
  );
}

function WhiteboardCard({ label, title }: { label: string; title: string }) {
  return (
    <div className="box" style={{ background: 'var(--paper-2)', minHeight: 104, padding: 12 }}>
      <p className="tiny-mono">{label}</p>
      <p className="h-hand mt-3 text-[22px] leading-none">{title}</p>
    </div>
  );
}

function MiniCard({ title, stat }: { title: string; stat: string }) {
  return (
    <div className="rounded-sm border border-[var(--ink)] bg-[var(--paper)] p-2">
      <p className="h-hand text-[18px] leading-none">{title}</p>
      <p className="tiny-mono mt-2">{stat}</p>
    </div>
  );
}

function StackRows() {
  const rows = [
    ['stt', 'deepgram'],
    ['llm', 'openai'],
    ['tts', 'cartesia'],
    ['rtc', 'livekit'],
  ];
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {rows.map(([label, value]) => (
        <li key={label} className="tiny-mono flex items-center justify-between gap-3">
          <span>{label}</span>
          <span>{value}</span>
        </li>
      ))}
    </ul>
  );
}

function LiveEkg() {
  const voice = useVoiceAssistant();
  return (
    <AgentAudioVisualizerBar
      size="lg"
      state={voice.state}
      color="#2d7a4f"
      audioTrack={voice.audioTrack}
      className="w-full"
    />
  );
}

function StaticEkg() {
  return (
    <svg viewBox="0 0 720 180" className="h-44 w-full" aria-hidden="true">
      <path
        d="M0 96 L90 96 L112 42 L132 138 L154 96 L260 96 L280 68 L302 122 L326 96 L430 96 L452 54 L472 132 L492 96 L720 96"
        fill="none"
        stroke="var(--vg-green)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function WalkieAntenna() {
  return (
    <>
      <span
        aria-hidden="true"
        style={{
          background: 'var(--ink)',
          borderRadius: '4px 4px 0 0',
          height: 26,
          left: 24,
          position: 'absolute',
          top: -24,
          width: 8,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          background: 'var(--paper-2)',
          border: '1.5px solid var(--ink)',
          borderRadius: '50%',
          height: 8,
          left: 20,
          position: 'absolute',
          top: -30,
          width: 16,
        }}
      />
    </>
  );
}

function ClipboardClip() {
  return (
    <span
      aria-hidden="true"
      style={{
        background: 'var(--ink)',
        borderRadius: 3,
        height: 12,
        left: '50%',
        position: 'absolute',
        top: -8,
        transform: 'translateX(-50%)',
        width: 70,
      }}
    />
  );
}
