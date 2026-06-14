'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GALLERY, type GalleryEntry } from '@/components/contribute/gallery-manifest';

const COMPONENT_REQUEST_URL =
  'https://github.com/mahimairaja/voice-playground/issues/new?template=component-request.yml';

function envelopeFor(entry: GalleryEntry): string {
  return JSON.stringify(
    { type: 'ui_event', component: entry.name, action: 'mount', props: entry.sampleProps },
    null,
    2
  );
}

function GalleryTile({ entry }: { entry: GalleryEntry }) {
  const [open, setOpen] = useState(false);
  const Comp = entry.Component;
  const renderProps = entry.defaultTitle
    ? { title: entry.defaultTitle, ...entry.sampleProps }
    : entry.sampleProps;

  return (
    <div className="flex flex-col rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-[13px] font-semibold text-[color:var(--color-text)]">
          {entry.name}
        </h3>
        {entry.aliasOf ? (
          <span className="font-mono text-[10px] text-[color:var(--color-text-mute)]">
            alias of {entry.aliasOf}
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-[12.5px] leading-[1.5] text-[color:var(--color-text-mute)]">
        {entry.description}
      </p>

      <div className="mt-3">
        <Comp {...renderProps} />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 flex cursor-pointer items-center gap-1.5 self-start font-mono text-[11px] tracking-[0.04em] text-[color:var(--color-accent-dim)] hover:underline"
      >
        <ChevronDown
          size={13}
          className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
          aria-hidden="true"
        />
        {open ? 'hide contract' : 'what your agent sends'}
      </button>

      {open ? (
        <div className="mt-2.5">
          <pre className="overflow-x-auto rounded-[8px] bg-[color:var(--color-scope)] p-3 font-mono text-[11px] leading-[1.55] text-[color:var(--color-scope-text)]">
            {envelopeFor(entry)}
          </pre>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.propHints.map((hint) => (
              <span
                key={hint}
                className="rounded-[var(--radius-pill)] bg-[color:var(--color-surface-2)] px-2.5 py-1 font-mono text-[10.5px] text-[color:var(--color-text-mute)]"
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Live gallery of every generative-UI component an agent can mount. Each tile
 * renders the real component with sample props and expands to the ui_event
 * envelope + prop list. Driven by gallery-manifest (kept in sync with the
 * registry by gallery-manifest.test.ts).
 */
export function ComponentGallery() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {GALLERY.map((entry) => (
          <GalleryTile key={entry.name} entry={entry} />
        ))}
      </div>

      <a
        href={COMPONENT_REQUEST_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-4 flex items-center justify-between rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] p-4 transition-colors hover:border-[color:var(--color-accent-dim)]"
      >
        <span className="text-[14px] text-[color:var(--color-text-dim)]">
          Need a shape these don&apos;t cover? Request a component.
        </span>
        <span className="font-mono text-[12px] text-[color:var(--color-accent-dim)]">
          open issue ↗
        </span>
      </a>
    </div>
  );
}
