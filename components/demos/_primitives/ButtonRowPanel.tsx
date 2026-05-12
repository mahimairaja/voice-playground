'use client';

/**
 * Generative-UI primitive: a horizontal row of brand .btn buttons. Buttons
 * with 'href' render as anchors. Buttons with 'action' dispatch a
 * 'voice-playground:cta' CustomEvent on the window so the demo bundle can
 * listen and react (e.g. send a structured response back to the agent over
 * the LiveKit data channel).
 *
 * Demo bundles wire the listener themselves:
 *   window.addEventListener('voice-playground:cta', (e: CustomEvent) => {
 *     const { action } = e.detail;
 *     // ...respond to the agent
 *   });
 */
import { cn } from '@/lib/shadcn/utils';

export const CTA_EVENT = 'voice-playground:cta';

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

export function ButtonRowPanel({ title, buttons, className }: ButtonRowPanelProps) {
  const dispatch = (button: ButtonRowButton) => {
    if (!button.action || typeof window === 'undefined') return;
    const detail: CtaEventDetail = { action: button.action, label: button.label };
    window.dispatchEvent(new CustomEvent(CTA_EVENT, { detail }));
  };

  return (
    <section className={cn('box', className)} style={{ padding: 14 }}>
      {title && (
        <p className="tiny-mono" style={{ marginBottom: 10 }}>
          {title}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {buttons.map((button, i) => {
          const className = cn('btn', button.primary && 'accent brand-accent', 'cursor-pointer');
          if (button.href) {
            return (
              <a
                key={`${button.label}-${i}`}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {button.label}
              </a>
            );
          }
          return (
            <button
              key={`${button.label}-${i}`}
              type="button"
              onClick={() => dispatch(button)}
              className={className}
            >
              {button.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
