'use client';

import { useEffect, useState } from 'react';
import { CredentialsButton } from '@/components/credentials/CredentialsButton';
import { DemoBundleLoader } from '@/components/demos/DemoBundleLoader';
import { VoiceSurface } from '@/components/playground/VoiceSurface';
import { type LoadedDemoManifest } from '@/lib/demos';
import { DEFAULT_DEMO_SURFACE, type DemoSurface } from '@/lib/demos/surface';

const LIVEKIT_CREDENTIALS = ['livekit_url', 'livekit_api_key', 'livekit_api_secret'] as const;

interface DemoRuntimeProps {
  demo: LoadedDemoManifest;
  initialSurface?: DemoSurface | null;
}

/**
 * Per-demo runtime. Mounts (in order):
 *   1. The demo bundle loader (registers per-demo generative UI components).
 *   2. A page header strip: demo title + category crumb + credentials button.
 *   3. The voice surface (two-pane runtime; F1.2 redesigns the inside).
 *
 * 'requiredCredentials' is read from the manifest's 'required_credentials',
 * unioned with the LiveKit triple the playground always needs to mint a token.
 */
export function DemoRuntime({ demo, initialSurface }: DemoRuntimeProps) {
  const [surface, setSurface] = useState<DemoSurface>(
    initialSurface ?? demo.default_surface ?? DEFAULT_DEMO_SURFACE
  );

  useEffect(() => {
    setSurface(initialSurface ?? demo.default_surface ?? DEFAULT_DEMO_SURFACE);
  }, [demo.default_surface, demo.slug, initialSurface]);

  const requiredCredentials = Array.from(
    new Set([...demo.required_credentials, ...LIVEKIT_CREDENTIALS])
  );

  return (
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
        <CredentialsButton requiredKeys={requiredCredentials} demoTitle={demo.title} />
      </div>

      <VoiceSurface
        demo={demo}
        requiredCredentials={requiredCredentials}
        surface={surface}
        onSurfaceChange={setSurface}
      />
    </div>
  );
}
