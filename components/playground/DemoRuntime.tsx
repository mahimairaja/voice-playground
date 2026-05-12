'use client';

import { useEffect, useState } from 'react';
import { DemoBundleLoader } from '@/components/demos/DemoBundleLoader';
import { CredentialsDrawer } from '@/components/playground/CredentialsDrawer';
import { VoiceSurface } from '@/components/playground/VoiceSurface';
import { type DemoManifest } from '@/lib/demos/schema';
import { DEFAULT_DEMO_SURFACE, type DemoSurface } from '@/lib/demos/surface';

const LIVEKIT_CREDENTIALS = ['livekit_url', 'livekit_api_key', 'livekit_api_secret'] as const;
const REFERENCE_DRAWER_CREDENTIALS = ['openai', 'deepgram', 'cartesia', 'livekit_url'] as const;

interface DemoRuntimeProps {
  demo: DemoManifest;
  initialSurface?: DemoSurface | null;
  isSeed?: boolean;
}

export function DemoRuntime({ demo, initialSurface, isSeed = false }: DemoRuntimeProps) {
  const [surface, setSurface] = useState<DemoSurface>(
    initialSurface ?? demo.default_surface ?? DEFAULT_DEMO_SURFACE
  );

  useEffect(() => {
    setSurface(initialSurface ?? demo.default_surface ?? DEFAULT_DEMO_SURFACE);
  }, [demo.default_surface, demo.slug, initialSurface]);

  const requiredCredentials = Array.from(
    new Set([...demo.required_credentials, ...LIVEKIT_CREDENTIALS])
  );
  const drawerCredentials = Array.from(
    new Set(isSeed ? [...REFERENCE_DRAWER_CREDENTIALS] : requiredCredentials)
  );

  return (
    <>
      <DemoBundleLoader slug={demo.slug} />
      <VoiceSurface
        demo={demo}
        requiredCredentials={requiredCredentials}
        surface={surface}
        onSurfaceChange={setSurface}
      />
      <CredentialsDrawer
        requiredCredentials={drawerCredentials}
        trigger={
          <button type="button" className="sr-only">
            open vault
          </button>
        }
      />
    </>
  );
}
