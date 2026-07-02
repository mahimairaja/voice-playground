import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';

export type ScopeFooterCell = [label: string, value: ReactNode, color?: string];

interface ScopeFrameProps {
  title: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  footer?: ScopeFooterCell[];
  accentHeader?: boolean;
  /**
   * When true the body is a dark instrument screen: scope background plus a
   * scoped `dark` class so semantic-token consumers inside flip to screen
   * colors. Default is a light panel body.
   */
  screen?: boolean;
  className?: string;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
}

/**
 * The instrument panel: a light chassis (header rail + optional footer
 * readouts) around a body that is either a plain light panel or, with
 * `screen`, a dark oscilloscope screen. The recurring card shape across
 * every surface.
 */
export function ScopeFrame({
  title,
  right,
  children,
  footer,
  accentHeader,
  screen,
  className,
  bodyClassName,
  bodyStyle,
}: ScopeFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-panel)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] shadow-[0_1px_3px_rgba(17,22,28,0.08)]',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between border-b border-[color:var(--color-border)] px-[15px] py-[11px] font-mono text-[11px] tracking-[0.1em] text-[color:var(--color-text-mute)]',
          accentHeader && 'bg-[color:var(--color-surface-2)]'
        )}
      >
        <span>{title}</span>
        {right ? <span>{right}</span> : null}
      </div>
      <div
        className={cn(screen && 'dark bg-[color:var(--color-scope)]', bodyClassName)}
        style={bodyStyle}
      >
        {children}
      </div>
      {footer && footer.length > 0 ? (
        <div
          className="grid border-t border-[color:var(--color-border)] font-mono text-[11px]"
          style={{ gridTemplateColumns: `repeat(${footer.length},1fr)` }}
        >
          {footer.map(([label, value, color], i) => (
            <div
              key={label}
              className={cn(
                'px-[15px] py-3',
                i < footer.length - 1 && 'border-r border-[color:var(--color-border-dim)]'
              )}
            >
              <div className="tracking-[0.1em] text-[color:var(--color-text-mute)]">{label}</div>
              <div
                className="mt-1 text-[13.5px]"
                style={{ color: color ?? 'var(--color-accent-dim)' }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
