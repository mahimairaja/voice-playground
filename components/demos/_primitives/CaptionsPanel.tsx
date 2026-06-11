'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/shadcn/utils';

export interface CaptionItem {
  text: string;
  original?: string;
}

export interface CaptionsPanelProps {
  title?: string;
  items: CaptionItem[];
  className?: string;
}

/** Defensive cap; agents are expected to send a short rolling window. */
const MAX_VISIBLE = 20;

export function CaptionsPanel({ title = 'live captions', items, className }: CaptionsPanelProps) {
  const scrollRef = useRef<HTMLOListElement | null>(null);
  const visible = items.slice(-MAX_VISIBLE);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items]);

  return (
    <section
      className={cn(
        'rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3.5',
        className
      )}
    >
      {title && (
        <p className="mb-2 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {title}
        </p>
      )}
      {visible.length === 0 ? (
        <p className="text-[12px] text-[color:var(--color-text-mute)]">
          Captions appear here as the conversation flows.
        </p>
      ) : (
        <ol ref={scrollRef} className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {visible.map((item, i) => {
            const newest = i === visible.length - 1;
            return (
              <li
                key={`${i}-${item.text.slice(0, 32)}`}
                className={cn(
                  'border-l-2 py-1 pl-3 transition-opacity',
                  newest
                    ? 'border-[color:var(--color-accent)] opacity-100'
                    : 'border-[color:var(--color-border-dim)] opacity-60'
                )}
              >
                <p className="text-[14px] leading-snug font-medium text-[color:var(--color-text)]">
                  {item.text}
                </p>
                {item.original && (
                  <p className="mt-0.5 text-[12px] leading-snug text-[color:var(--color-text-mute)]">
                    {item.original}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
