'use client';

import { useEffect, useState } from 'react';
import { selectInstances, useUiStore } from '@/lib/generative-ui/dispatcher';
import { hasRegistration, listComponents, resolve } from '@/lib/generative-ui/registry';
import { cn } from '@/lib/shadcn/utils';

interface CanvasProps {
  slug: string;
  className?: string;
  /** Empty-state message override. Defaults to a brand-styled placeholder. */
  emptyState?: React.ReactNode;
}

/**
 * Renders the active generative-UI component instances for a demo.
 *
 * Reads from the global Zustand store filled by 'useUiDispatcher' (T27, mounted
 * inside the live RoomContext by VoiceSurface). Resolves each instance's
 * component name through the per-demo registry (T26) and renders. Unknown
 * names are skipped with a single console.warn per name; unsupported
 * components do not break the page.
 *
 * The store is global, so the Canvas can live anywhere on the page; no
 * RoomContext access is required on the read side.
 */
export function Canvas({ slug, className, emptyState }: CanvasProps) {
  const instances = useUiStore(selectInstances);
  const [warnedNames] = useState(() => new Set<string>());

  useEffect(() => {
    /* presence of slug in deps makes warning state reset implicit on slug change */
  }, [slug]);

  const registered = hasRegistration(slug);

  if (instances.length === 0) {
    return (
      <div className={cn('w-full', className)} data-canvas-slug={slug} data-canvas-state="empty">
        {emptyState ?? <DefaultEmpty slug={slug} registered={registered} />}
      </div>
    );
  }

  const cardCount = instances.length;
  return (
    <div
      className={cn('relative w-full', className)}
      data-canvas-slug={slug}
      data-canvas-state="populated"
      style={{
        background: 'var(--paper-2)',
        border: '1.5px solid var(--ink)',
        borderRadius: 6,
        boxShadow: '4px 4px 0 var(--ink)',
        padding: 14,
      }}
    >
      <header className="flex items-baseline justify-between gap-2">
        <p className="tiny-mono">· drawn by agent</p>
        <p className="tiny-mono">
          {cardCount} card{cardCount === 1 ? '' : 's'}
        </p>
      </header>
      <div className="line mt-2 mb-3"></div>
      <div className="flex flex-col gap-3">
        {instances.map((instance) => {
          const Component = resolve(slug, instance.component);
          if (!Component) {
            if (!warnedNames.has(instance.component)) {
              warnedNames.add(instance.component);
              console.warn(
                `[canvas] '${slug}' has no component named '${instance.component}'. Skipping.`
              );
            }
            return null;
          }
          return (
            <div
              key={instance.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <Component
                {...instance.props}
                data-instance-id={instance.id}
                data-instance-mounted-at={instance.mountedAt}
              />
            </div>
          );
        })}
      </div>
      {/* chalk eraser */}
      <span
        aria-hidden="true"
        title="erases on call end"
        style={{
          position: 'absolute',
          bottom: 10,
          right: 12,
          width: 44,
          height: 14,
          background: 'var(--ink)',
          border: '1.5px solid var(--ink)',
          borderRadius: 3,
        }}
      />
    </div>
  );
}

interface DefaultEmptyProps {
  slug: string;
  registered: boolean;
}

function DefaultEmpty({ slug, registered }: DefaultEmptyProps) {
  if (!registered) {
    const known = listComponents(slug);
    return (
      <div className="box dashed" style={{ padding: 18 }}>
        <p className="tiny-mono">canvas · waiting</p>
        <p className="p-hand sm" style={{ marginTop: 6 }}>
          No components registered for <span className="kbd">{slug}</span> yet. The per-demo bundle{' '}
          <span className="kbd">components/demos/{slug}/index.ts</span> ships in M2.
          {known.length > 0 ? ` Found: ${known.join(', ')}.` : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="box dashed" style={{ padding: 18 }}>
      <p className="tiny-mono">canvas · idle</p>
      <p className="p-hand sm" style={{ marginTop: 6 }}>
        The agent has not mounted any components yet. They appear here in real time.
      </p>
    </div>
  );
}
