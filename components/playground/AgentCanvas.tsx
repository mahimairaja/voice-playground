'use client';

import { useMemo } from 'react';
import { ScopeFrame } from '@/components/phosphor';
import { AgentCanvasEmpty } from '@/components/playground/AgentCanvasEmpty';
import type { useDemoSession } from '@/hooks/useDemoSession';
import type { ShippedDemo } from '@/lib/demos';
import { useUiStore } from '@/lib/generative-ui/dispatcher';
import { HEALTH_INSTANCE_ID } from '@/lib/generative-ui/health';
import { resolve } from '@/lib/generative-ui/registry';

/**
 * Right column of the demo page: the generative-UI canvas, framed as a
 * "CANVAS · <slug>" instrument panel. Three branches on session state:
 *
 *   idle / connecting → '<AgentCanvasEmpty>' with the demo's description
 *                       and the 'ui_components' chip row from the manifest.
 *   live              → hosts whatever the per-demo registry resolved for
 *                       each mounted instance pushed by the dispatcher.
 *   ended             → same as live; the dispatcher store is intentionally
 *                       not cleared on disconnect so the developer can still
 *                       see what was on screen when the agent dropped.
 *
 * The registry / dispatcher pipeline is unchanged from F1.1; F1.3 replaces
 * the underlying protocol but the consumer-side interface here stays.
 */

interface AgentCanvasProps {
  demo: ShippedDemo;
  session: ReturnType<typeof useDemoSession>;
}

export function AgentCanvas({ demo, session }: AgentCanvasProps) {
  // Subscribe to the stable map (not a fresh sorted array on every read) so
  // Zustand's identity check is happy. Sort + arrayify inside useMemo.
  const instancesMap = useUiStore((s) => s.instances);
  const instances = useMemo(
    () =>
      Object.values(instancesMap)
        .filter((i) => i.id !== HEALTH_INSTANCE_ID)
        .sort((a, b) => a.mountedAt - b.mountedAt),
    [instancesMap]
  );

  const mounted = instances.length > 0;
  const showEmpty = session.state === 'idle' || session.state === 'connecting' || !mounted;

  return (
    <section aria-label="Agent surface" className="flex flex-1 flex-col">
      <ScopeFrame
        title={`CANVAS · ${demo.slug}`}
        right={
          mounted ? (
            <span className="text-[color:var(--color-live)]">● {instances.length} mounted</span>
          ) : (
            <span>waiting</span>
          )
        }
        className="flex h-full flex-col"
        bodyClassName="flex-1"
      >
        {showEmpty ? (
          <AgentCanvasEmpty demo={demo} />
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {instances.map((instance) => {
              const Resolved = resolve(demo.slug, instance.component);
              if (!Resolved) {
                return (
                  <div
                    key={instance.id}
                    className="rounded-[var(--radius-input)] border border-dashed border-[color:var(--color-border)] p-3 font-mono text-[12px] text-[color:var(--color-text-mute)]"
                  >
                    unregistered component: {instance.component}
                  </div>
                );
              }
              return <Resolved key={instance.id} {...instance.props} />;
            })}
          </div>
        )}
      </ScopeFrame>
    </section>
  );
}
