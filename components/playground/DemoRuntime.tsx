'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ParticipantKind } from 'livekit-client';
import { toast } from 'sonner';
import { RoomAudioRenderer, RoomContext, useRemoteParticipants } from '@livekit/components-react';
import { CredentialsButton } from '@/components/credentials/CredentialsButton';
import { DemoBundleLoader } from '@/components/demos/DemoBundleLoader';
import { Eyebrow, ScopeFrame } from '@/components/phosphor';
import { AgentCanvas } from '@/components/playground/AgentCanvas';
import { CookbookSourceLink } from '@/components/playground/CookbookSourceLink';
import { CopySnippet } from '@/components/playground/CopySnippet';
import { UpvoteButton } from '@/components/playground/UpvoteButton';
import { VoicePanel } from '@/components/playground/VoicePanel';
import { CallView } from '@/components/playground/call/CallView';
import { InviteToCall } from '@/components/playground/call/InviteToCall';
import {
  DEFAULT_TARGET_LANGUAGE,
  TargetLanguageSelect,
} from '@/components/playground/call/TargetLanguageSelect';
import { useDemoSession } from '@/hooks/useDemoSession';
import { CRED_OPEN_DRAWER_EVENT, LIVEKIT_KEYS } from '@/lib/credentials/store';
import { useCredentials } from '@/lib/credentials/useCredentials';
import type { ShippedDemo } from '@/lib/demos';
import { useUiDispatcher } from '@/lib/generative-ui/dispatcher';

interface DemoRuntimeProps {
  demo: ShippedDemo;
}

type DemoSession = ReturnType<typeof useDemoSession>;

function openVault() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CRED_OPEN_DRAWER_EVENT));
}

/**
 * The default two-pane demo layout: SCOPE + TRANSCRIPT on the left, the agent
 * CANVAS plus credentials and the run-the-worker note on the right. For a
 * multiparty demo that is live and solo (no guest yet), the right column also
 * shows the invite control so the host can pull a second person onto the call.
 */
function TwoPane({
  demo,
  session,
  isReady,
}: {
  demo: ShippedDemo;
  session: DemoSession;
  isReady: boolean;
}) {
  const showInvite = demo.multiparty === true && session.state === 'live' && !!session.room;
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
      <VoicePanel session={session} isReady={isReady} slug={demo.slug} />

      <div className="flex flex-col gap-4">
        <AgentCanvas demo={demo} session={session} />

        {showInvite && session.room ? (
          <div className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-accent-dim)] p-3.5">
            <p className="font-mono text-[11px] tracking-[0.06em] text-[color:var(--color-text-mute)] uppercase">
              two-party call
            </p>
            <p className="mt-1.5 mb-3 text-[13px] leading-[1.5] text-[color:var(--color-text-dim)]">
              Bring a second person onto this call. Open the link in another tab or send it to a
              phone.
            </p>
            <InviteToCall room={session.room} slug={demo.slug} />
          </div>
        ) : null}

        <ScopeFrame title="REQUIRED CREDENTIALS" bodyClassName="p-[15px]">
          <div className="flex flex-wrap gap-2">
            {LIVEKIT_KEYS.map((key) => (
              <span
                key={key}
                className="rounded-[var(--radius-pill)] border border-[color:var(--color-border)] px-2.5 py-[5px] font-mono text-[11px] tracking-[0.06em] text-[color:var(--color-text-dim)] uppercase"
              >
                {key}
              </span>
            ))}
            <span
              className="mt-1 w-full font-mono text-[11px]"
              style={{ color: isReady ? 'var(--color-live)' : 'var(--color-warning)' }}
            >
              LiveKit: {isReady ? '✓ keys present' : '✗ add your keys'}
            </span>
          </div>
        </ScopeFrame>

        <div className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-3.5 font-mono text-[12px] leading-[1.6] text-[color:var(--color-text-mute)]">
          Run the worker locally:
          <div className="my-2">
            <CopySnippet command="uv run python agent.py dev" />
          </div>
          then connect: the agent joins room{' '}
          <span className="text-[color:var(--color-text-dim)]">{demo.slug}</span>.
        </div>
      </div>
    </div>
  );
}

/**
 * Call-first layer for a multiparty demo. Renders only when a room exists, so it
 * is always inside RoomContext and can read remote participants. Solo (only the
 * agent is remote) shows the normal demo via `fallback`; once a second human
 * joins it swaps to the CallView. The host camera is enabled lazily on
 * guest-present so the camera light stays off while the host is alone; a camera
 * failure leaves the call audio-only rather than tearing it down.
 */
function MultipartyCallLayer({
  demo,
  session,
  fallback,
}: {
  demo: ShippedDemo;
  session: DemoSession;
  fallback: React.ReactNode;
}) {
  const remotes = useRemoteParticipants();
  const room = session.room;
  const hasGuest = remotes.some((p) => p.kind !== ParticipantKind.AGENT);
  const inCall = session.state === 'live' && !!room && hasGuest;
  const cameraOnRef = useRef(false);

  useEffect(() => {
    if (!room) return;
    if (inCall && !cameraOnRef.current) {
      cameraOnRef.current = true;
      room.localParticipant.setCameraEnabled(true).catch(() => {
        toast.error('Could not turn on your camera. You are on the call with audio only.');
      });
    } else if (!inCall && cameraOnRef.current) {
      // Guest left or the call ended: stop publishing the camera so the host's
      // webcam light does not stay on over the solo demo, and reset so a later
      // guest re-enables it.
      cameraOnRef.current = false;
      room.localParticipant.setCameraEnabled(false).catch(() => {});
    }
  }, [inCall, room]);

  if (inCall && room) {
    return <CallView room={room} role="host" slug={demo.slug} onLeave={session.disconnect} />;
  }
  return <>{fallback}</>;
}

/**
 * Per-demo runtime. Owns the session state machine and the two-pane layout.
 *
 *   [← channel rack]
 *   [category · surface]  title  description / who_for       [source ↗] [vault]
 *   [ missing-keys banner when keys absent ]
 *   [ SCOPE + TRANSCRIPT (1.5fr) | CANVAS + CREDENTIALS + worker note (1fr) ]
 *
 * The whole runtime is wrapped in 'RoomContext.Provider' when a session is
 * active so child components (transcript, audio visualizer, mounted bundles)
 * can hit LiveKit hooks without per-component room threading.
 */
export function DemoRuntime({ demo }: DemoRuntimeProps) {
  const multiparty = demo.multiparty === true;
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const session = useDemoSession({
    slug: demo.slug,
    // The desk language only applies to the interpreter; other demos dispatch
    // their agent without metadata.
    agentMetadata: multiparty ? targetLanguage : undefined,
  });
  const { isReady } = useCredentials(LIVEKIT_KEYS);

  // Subscribe the dispatcher store to the LiveKit data channel; clears on
  // slug change (handled inside the hook).
  useUiDispatcher(session.room, demo.slug);

  const Wrapper = session.room ? RoomContext.Provider : (Fragment as React.ElementType);
  const wrapperProps = session.room ? { value: session.room } : {};

  return (
    <Wrapper {...wrapperProps}>
      <>
        {/* Play the agent's remote audio track. Without this the TTS track is
            received and visualized but never routed to the speakers. Renders
            only inside a live RoomContext (uses LiveKit room hooks). */}
        {session.room ? <RoomAudioRenderer /> : null}

        <DemoBundleLoader slug={demo.slug} />

        <div className="mx-auto w-full max-w-[1180px] px-6 pt-8 pb-16">
          <Link
            href="/demos"
            className="font-mono text-[12px] tracking-[0.06em] text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-accent-dim)]"
          >
            ← all demos
          </Link>

          <div className="mt-3.5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>
                {demo.category} · surface: {demo.slug}
              </Eyebrow>
              <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
                {demo.title}
              </h1>
              <p className="mt-1.5 max-w-[54ch] text-[15px] leading-[1.55] text-[color:var(--color-text-dim)]">
                {demo.description}{' '}
                <span className="text-[color:var(--color-text-mute)]">{demo.who_for}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <UpvoteButton slug={demo.slug} />
              <CookbookSourceLink slug={demo.slug} variant="chip" />
              <CredentialsButton demoTitle={demo.title} />
            </div>
          </div>

          {!isReady ? (
            <div className="mt-5 flex flex-wrap items-center gap-3.5 rounded-[var(--radius-panel)] border border-[color:color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--color-warning)_6%,transparent)] px-4 py-3.5">
              <span
                className="h-2 w-2 rounded-full bg-[color:var(--color-warning)]"
                aria-hidden="true"
              />
              <span className="font-mono text-[12px] tracking-[0.03em] text-[color:var(--color-warning)]">
                NO LIVEKIT CREDENTIALS
              </span>
              <span className="text-[14px] text-[color:var(--color-text-dim)]">
                Paste your LiveKit URL, key and secret to connect the scope to a live room.
              </span>
              <button
                type="button"
                onClick={openVault}
                className="ml-auto cursor-pointer font-mono text-[12px] whitespace-nowrap text-[color:var(--color-accent-dim)] hover:underline"
              >
                add keys →
              </button>
            </div>
          ) : null}

          {multiparty ? (
            <div className="mt-5">
              <TargetLanguageSelect
                value={targetLanguage}
                onChange={setTargetLanguage}
                disabled={session.state === 'connecting' || session.state === 'live'}
              />
            </div>
          ) : null}

          {multiparty && session.room ? (
            <div className="mt-6">
              <MultipartyCallLayer
                demo={demo}
                session={session}
                fallback={<TwoPane demo={demo} session={session} isReady={isReady} />}
              />
            </div>
          ) : (
            <div className="mt-6">
              <TwoPane demo={demo} session={session} isReady={isReady} />
            </div>
          )}
        </div>
      </>
    </Wrapper>
  );
}
