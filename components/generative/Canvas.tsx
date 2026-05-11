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
    <WhiteboardFrame
      slug={slug}
      className={className}
      state="populated"
      heading="what the agent put up"
      meta={`${cardCount} card${cardCount === 1 ? '' : 's'}`}
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
        style={{
          fontFamily: 'var(--hand-title)',
          fontWeight: 700,
          fontSize: 22,
          lineHeight: 1.05,
        }}
      >
        {heading}
      </h3>
      <div className="line mt-2 mb-3"></div>
      {children}
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

function NextChips() {
  return (
    <div className="mt-4">
      <div className="line soft mb-2"></div>
      <p className="tiny-mono">· next</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="chip">book viewing</span>
        <span className="chip">send PDFs</span>
        <span
          className="chip"
          title="planned for a future release"
          style={{
            borderStyle: 'dashed',
            color: 'var(--ink-soft)',
          }}
        >
          compare
        </span>
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
        <p className="p-hand sm">
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
      <p className="p-hand sm">
        Cards from the agent appear here in real time. Each one mounts, updates, or unmounts on its
        own.
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
            border: '1.2px dashed var(--line-soft)',
            borderRadius: 4,
            background:
              'repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,.05) 6px 7px), var(--paper)',
            height: 56,
          }}
        />
      ))}
    </div>
  );
}
