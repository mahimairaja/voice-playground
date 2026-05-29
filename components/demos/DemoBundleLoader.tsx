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
        // Every demo renders through the global vocabulary. A genuinely
        // bespoke demo could still add a per-slug bundle here and register it
        // via registerForDemo, but that is the rare exception, not the rule.
        await import('@/components/demos/_vocabulary');
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
