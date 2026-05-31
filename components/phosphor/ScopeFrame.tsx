import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';

export type ScopeFooterCell = [label: string, value: ReactNode, color?: string];

interface ScopeFrameProps {
  title: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  footer?: ScopeFooterCell[];
  accentHeader?: boolean;
  className?: string;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
}

/**
 * The PHOSPHOR instrument panel: a header rail (title + right readout), a body,
 * and an optional row of footer readouts. The recurring card shape across every
 * surface.
 */
export function ScopeFrame({
  title,
  right,
  children,
  footer,
  accentHeader,
  className,
  bodyClassName,
  bodyStyle,
}: ScopeFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_24px_60px_rgba(0,0,0,0.45)]',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between border-b border-[color:var(--color-border-dim)] px-[15px] py-[11px] font-mono text-[10.5px] tracking-[0.1em] text-[color:var(--color-text-mute)]',
          accentHeader && 'bg-[color:var(--color-surface-2)]'
        )}
      >
        <span>{title}</span>
        {right ? <span>{right}</span> : null}
      </div>
      <div className={bodyClassName} style={bodyStyle}>
        {children}
      </div>
      {footer && footer.length > 0 ? (
        <div
          className="grid border-t border-[color:var(--color-border-dim)] font-mono text-[10.5px]"
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
              <div className="tracking-[0.1em] text-[color:var(--color-text-fade)]">{label}</div>
              <div className="mt-1 text-[13.5px]" style={{ color: color ?? 'var(--color-accent)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
