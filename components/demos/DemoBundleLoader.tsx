'use client';

import { useEffect } from 'react';

/**
 * Imports the per-demo component bundle for a given slug at mount time.
 *
 * Each case is an explicit dynamic import so Next.js can statically bundle
 * the demo code. A dynamic-string import (e.g. 'import(`./demos/${slug}`)')
 * would force every bundle into the same chunk and defeat code-splitting.
 *
 * Side-effect-only: the imported module calls 'registerForDemo' at module
 * load. Returning null keeps this purely as a registration hook in the
 * React tree.
 *
 * Add a new demo by:
 *   1. Creating 'components/demos/<slug>/index.tsx' that registers itself.
 *   2. Adding a 'case <slug>' to the switch below.
 */
export interface DemoBundleLoaderProps {
  slug: string;
}

export function DemoBundleLoader({ slug }: DemoBundleLoaderProps) {
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        switch (slug) {
          case 'drive-thru-coffee':
            await import('@/components/demos/drive-thru-coffee');
            break;
          default:
            // Unknown slug: Canvas renders the registry-unaware empty state.
            break;
        }
      } catch (err) {
        if (!cancelled) {
          console.warn(`[demo-bundle] failed to load bundle for '${slug}':`, err);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return null;
}
