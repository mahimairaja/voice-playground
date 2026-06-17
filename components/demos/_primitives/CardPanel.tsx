'use client';

import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/shadcn/utils';

// A body longer than this clamps to a few lines on the card and gains a popup to
// read it in full. Short cards (notices, status lines) render exactly as before.
const EXPAND_THRESHOLD = 200;

export interface CardPanelProps {
  title?: string;
  subtitle?: string;
  body?: string;
  image_url?: string;
  footer?: string;
  accent?: boolean;
  className?: string;
}

export function CardPanel({
  title,
  subtitle,
  body,
  image_url,
  footer,
  accent,
  className,
}: CardPanelProps) {
  const expandable = !!body && body.length > EXPAND_THRESHOLD;
  return (
    <article
      className={cn(
        'rounded-[var(--radius-panel)] border bg-[color:var(--color-surface-2)] p-3.5',
        accent ? 'border-[color:var(--color-accent)]' : 'border-[color:var(--color-border)]',
        className
      )}
    >
      {subtitle && (
        <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {subtitle}
        </p>
      )}
      {title && (
        <h3
          className={cn(
            'text-[16px] leading-tight font-semibold text-[color:var(--color-text)]',
            subtitle && 'mt-1'
          )}
        >
          {title}
        </h3>
      )}
      {image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image_url}
          alt=""
          className="mt-3 block w-full rounded-[4px] border border-[color:var(--color-border)]"
        />
      )}
      {body && (
        <p
          className={cn(
            'text-[13px] text-[color:var(--color-text-dim)]',
            (image_url || title) && 'mt-2.5',
            expandable && 'line-clamp-3'
          )}
        >
          {body}
        </p>
      )}
      {expandable && (
        <Dialog.Root>
          <Dialog.Trigger className="mt-2 cursor-pointer font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-accent-dim)] uppercase transition-colors hover:text-[color:var(--color-accent)]">
            Read full passage
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[80vh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-5 shadow-xl">
              {subtitle && (
                <Dialog.Description className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
                  {subtitle}
                </Dialog.Description>
              )}
              <Dialog.Title className="mt-1 text-[18px] leading-tight font-semibold text-[color:var(--color-text)]">
                {title ?? 'Source'}
              </Dialog.Title>
              <p className="mt-3 text-[14px] leading-relaxed whitespace-pre-line text-[color:var(--color-text-dim)]">
                {body}
              </p>
              <Dialog.Close
                aria-label="Close"
                className="absolute top-3 right-3 cursor-pointer rounded-[6px] p-1 text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-text)]"
              >
                <X size={16} />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
      {footer && (
        <p className="mt-3 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {footer}
        </p>
      )}
    </article>
  );
}
