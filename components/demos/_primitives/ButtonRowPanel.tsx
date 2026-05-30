'use client';

import { cn } from '@/lib/shadcn/utils';

export const CTA_EVENT = 'mahimai:cta';

export interface CtaEventDetail {
  action: string;
  label?: string;
}

export interface ButtonRowButton {
  label: string;
  href?: string;
  action?: string;
  primary?: boolean;
}

export interface ButtonRowPanelProps {
  title?: string;
  buttons: ButtonRowButton[];
  className?: string;
}

const BASE =
  'inline-flex cursor-pointer items-center rounded-[var(--radius-button)] px-3 py-1.5 font-mono text-[12px] transition-colors';

function buttonClass(primary?: boolean): string {
  return cn(
    BASE,
    primary
      ? 'bg-[color:var(--color-accent)] font-semibold text-[#1a1200] hover:opacity-90'
      : 'border border-[color:var(--color-border)] text-[color:var(--color-text-dim)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text)]'
  );
}

export function ButtonRowPanel({ title, buttons, className }: ButtonRowPanelProps) {
  const dispatch = (button: ButtonRowButton) => {
    if (!button.action || typeof window === 'undefined') return;
    const detail: CtaEventDetail = { action: button.action, label: button.label };
    window.dispatchEvent(new CustomEvent(CTA_EVENT, { detail }));
  };

  return (
    <section
      className={cn(
        'rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3.5',
        className
      )}
    >
      {title && (
        <p className="mb-2.5 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {title}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        {buttons.map((button, i) =>
          button.href ? (
            <a
              key={`${button.label}-${i}`}
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass(button.primary)}
            >
              {button.label}
            </a>
          ) : (
            <button
              key={`${button.label}-${i}`}
              type="button"
              onClick={() => dispatch(button)}
              className={buttonClass(button.primary)}
            >
              {button.label}
            </button>
          )
        )}
      </div>
    </section>
  );
}
