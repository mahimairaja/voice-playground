'use client';

import { useEffect } from 'react';

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
