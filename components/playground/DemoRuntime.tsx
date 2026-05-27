'use client';

import { Fragment } from 'react';
import { RoomContext } from '@livekit/components-react';
import { CredentialsButton } from '@/components/credentials/CredentialsButton';
import { DemoBundleLoader } from '@/components/demos/DemoBundleLoader';
import { AgentCanvas } from '@/components/playground/AgentCanvas';
import { CookbookSourceLink } from '@/components/playground/CookbookSourceLink';
import { VoicePanel } from '@/components/playground/VoicePanel';
import { useDemoSession } from '@/hooks/useDemoSession';
import { LIVEKIT_KEYS } from '@/lib/credentials/store';
import { useCredentials } from '@/lib/credentials/useCredentials';
import type { ShippedDemo } from '@/lib/demos';
import { useUiDispatcher } from '@/lib/generative-ui/dispatcher';

interface DemoRuntimeProps {
  demo: ShippedDemo;
}

/**
 * Per-demo runtime. Owns the session state machine and the two-pane layout.
 * Header strip sits above the two-pane:
 *
 *   [category crumb · title · who_for]   [source ↗] [SET KEYS · N]
 *
 * Layout C: voice panel on the left (~320 px) + agent canvas on the right
 * (fluid). Stacks vertically on mobile.
 *
 * The whole runtime is wrapped in 'RoomContext.Provider' when a session is
 * active so child components (transcript, audio visualizer, mounted bundles)
 * can hit LiveKit hooks without per-component room threading.
 */
export function DemoRuntime({ demo }: DemoRuntimeProps) {
  const session = useDemoSession({ slug: demo.slug });
  const { isReady } = useCredentials(LIVEKIT_KEYS);

  // Subscribe the dispatcher store to the LiveKit data channel; clears on
  // slug change (handled inside the hook).
  useUiDispatcher(session.room, demo.slug);

  const Wrapper = session.room ? RoomContext.Provider : (Fragment as React.ElementType);
  const wrapperProps = session.room ? { value: session.room } : {};

  return (
    <Wrapper {...wrapperProps}>
      <div className="flex flex-col">
        <DemoBundleLoader slug={demo.slug} />

        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--color-border-dim)] px-6 py-5">
          <div>
            <div className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
              · DEMOS · {demo.category}
            </div>
            <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[color:var(--color-text)]">
              {demo.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <CookbookSourceLink slug={demo.slug} variant="chip" />
            <CredentialsButton demoTitle={demo.title} />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-stretch">
          <VoicePanel session={session} isReady={isReady} />
          <AgentCanvas demo={demo} session={session} />
        </div>
      </div>
    </Wrapper>
  );
}
