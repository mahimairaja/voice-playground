'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';
import { GALLERY, type GalleryEntry } from '@/components/contribute/gallery-manifest';

const COMPONENT_REQUEST_URL =
  'https://github.com/mahimairaja/voice-playground/issues/new?template=component-request.yml';

// Show a handful up front; the rest expand on demand so the full catalog does
// not dominate the page.
const INITIAL_VISIBLE = 6;

function envelopeFor(entry: GalleryEntry): string {
  return JSON.stringify(
    { type: 'ui_event', component: entry.name, action: 'mount', props: entry.sampleProps },
    null,
    2
  );
}

function GalleryTile({ entry }: { entry: GalleryEntry }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Comp = entry.Component;
  // sampleProps spreads after defaultTitle, so an explicit title in props wins,
  // matching the registry's titled() alias behavior.
  const renderProps = entry.defaultTitle
    ? { title: entry.defaultTitle, ...entry.sampleProps }
    : entry.sampleProps;
  const envelope = envelopeFor(entry);
  const panelId = `contract-${entry.name}`;

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  const copyEnvelope = async () => {
    try {
      await navigator.clipboard.writeText(envelope);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can reject (insecure context / denied); the block stays
      // selectable, so fail quietly without a false tick.
    }
  };

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
        aria-controls={panelId}
        className="mt-3 flex cursor-pointer items-center gap-1.5 self-start font-mono text-[11px] tracking-[0.04em] text-[color:var(--color-accent-dim)] hover:underline"
      >
        <ChevronDown
          size={13}
          className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
          aria-hidden="true"
        />
        {open ? 'hide contract' : 'what your agent sends'}
      </button>

      <div id={panelId} hidden={!open} className="mt-2.5">
        <div className="relative">
          <pre className="overflow-x-auto rounded-[8px] bg-[color:var(--color-scope)] p-3 pr-10 font-mono text-[11px] leading-[1.55] text-[color:var(--color-scope-text)]">
            {envelope}
          </pre>
          <button
            type="button"
            aria-label={`Copy the ${entry.name} ui_event envelope`}
            onClick={copyEnvelope}
            className="absolute top-2 right-2 cursor-pointer rounded-[5px] p-1 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-scope-text)_12%,transparent)]"
          >
            {copied ? (
              <Check size={13} className="text-[color:var(--color-accent)]" />
            ) : (
              <Copy
                size={13}
                className="text-[color:var(--color-scope-text-dim)] hover:text-[color:var(--color-scope-text)]"
              />
            )}
          </button>
        </div>
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
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? GALLERY : GALLERY.slice(0, INITIAL_VISIBLE);
  const remaining = GALLERY.length - INITIAL_VISIBLE;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((entry) => (
          <GalleryTile key={entry.name} entry={entry} />
        ))}
      </div>

      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-2.5 font-mono text-[12px] tracking-[0.04em] text-[color:var(--color-accent-dim)] transition-colors hover:border-[color:var(--color-accent-dim)]"
        >
          <ChevronDown
            size={14}
            className={showAll ? 'rotate-180 transition-transform' : 'transition-transform'}
            aria-hidden="true"
          />
          {showAll ? 'show fewer' : `show ${remaining} more components`}
        </button>
      ) : null}

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
