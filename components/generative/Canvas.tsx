'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUiStore } from '@/lib/generative-ui/dispatcher';
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
  const instanceMap = useUiStore((state) => state.instances);
  const instances = useMemo(
    () => Object.values(instanceMap).sort((a, b) => a.mountedAt - b.mountedAt),
    [instanceMap]
  );
  const [warnedNames] = useState(() => new Set<string>());

  useEffect(() => {
    warnedNames.clear();
  }, [slug, warnedNames]);

  const registered = hasRegistration(slug);

  if (instances.length === 0) {
    return (
      <div className={cn('w-full', className)} data-canvas-slug={slug} data-canvas-state="empty">
        {emptyState ?? <DefaultEmpty slug={slug} registered={registered} />}
      </div>
    );
  }

  return (
    <WhiteboardFrame
      slug={slug}
      className={className}
      state="populated"
      meta={`${instances.length} card${instances.length === 1 ? '' : 's'}`}
      heading="what the agent put up"
    >
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
      <NextChips />
    </WhiteboardFrame>
  );
}

interface WhiteboardFrameProps {
  slug: string;
  className?: string;
  state: 'populated' | 'empty';
  heading: string;
  meta: string;
  children: React.ReactNode;
}

function WhiteboardFrame({
  slug,
  className,
  state,
  heading,
  meta,
  children,
}: WhiteboardFrameProps) {
  return (
    <div
      className={cn('relative w-full', className)}
      data-canvas-slug={slug}
      data-canvas-state={state}
      style={{
        background: 'var(--paper-2)',
        border: '1.5px solid var(--ink)',
        borderRadius: 6,
        boxShadow: '4px 4px 0 var(--ink)',
        padding: 14,
        paddingBottom: 36,
      }}
    >
      <header className="flex items-baseline justify-between gap-2">
        <p className="tiny-mono">· drawn by agent</p>
        <p className="tiny-mono">{meta}</p>
      </header>
      <h3
        className="mt-1"
        style={{ fontFamily: 'var(--hand-title)', fontSize: 22, fontWeight: 700, lineHeight: 1.05 }}
      >
        {heading}
      </h3>
      <div className="line mt-2 mb-3"></div>
      {children}
      <span
        aria-hidden="true"
        title="erases on call end"
        style={{
          background: 'var(--ink)',
          border: '1.5px solid var(--ink)',
          borderRadius: 3,
          bottom: 10,
          height: 14,
          position: 'absolute',
          right: 12,
          width: 44,
        }}
      />
    </div>
  );
}

function NextChips() {
  return (
    <div className="mt-4">
      <div className="line soft mb-2"></div>
      <p className="tiny-mono">· next</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="chip">book viewing</span>
        <span className="chip">send PDFs</span>
        <span className="chip dim">compare</span>
      </div>
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
      <WhiteboardFrame slug={slug} state="empty" heading="waiting on the bundle" meta="0 cards">
        <p className="p-hand sm" style={{ marginTop: 6 }}>
          No components registered for <span className="kbd">{slug}</span> yet. The per-demo bundle{' '}
          <span className="kbd">components/demos/{slug}/index.ts</span> ships in M2.
          {known.length > 0 ? ` Found: ${known.join(', ')}.` : ''}
        </p>
        <PlaceholderRow />
      </WhiteboardFrame>
    );
  }

  return (
    <WhiteboardFrame slug={slug} state="empty" heading="agent will draw here" meta="0 cards">
      <p className="p-hand sm" style={{ marginTop: 6 }}>
        The agent has not mounted any components yet. They appear here in real time.
      </p>
      <PlaceholderRow />
    </WhiteboardFrame>
  );
}

function PlaceholderRow() {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            background:
              'repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,.05) 6px 7px), var(--paper)',
            border: '1.2px dashed var(--line-soft)',
            borderRadius: 4,
            height: 56,
          }}
        />
      ))}
    </div>
  );
}
