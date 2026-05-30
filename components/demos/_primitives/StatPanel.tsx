import { cn } from '@/lib/shadcn/utils';

export interface StatPanelProps {
  label?: string;
  value: string | number;
  of?: number;
  caption?: string;
  className?: string;
}

export function StatPanel({ label, value, of, caption, className }: StatPanelProps) {
  const numeric = typeof value === 'number' ? value : Number(value);
  let pct: number | null = null;
  if (typeof of === 'number' && of > 0 && Number.isFinite(numeric)) {
    pct = Math.min(100, Math.max(0, Math.round((numeric / of) * 100)));
  }

  return (
    <section
      className={cn(
        'rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4',
        className
      )}
    >
      {label && (
        <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {label}
        </p>
      )}
      <div className={cn('flex items-baseline gap-2', label && 'mt-2')}>
        <span className="font-mono text-[30px] leading-none font-semibold text-[color:var(--color-accent)] tabular-nums">
          {value}
        </span>
        {typeof of === 'number' && of > 0 && (
          <span className="font-mono text-[14px] text-[color:var(--color-text-mute)] tabular-nums">
            / {of}
          </span>
        )}
      </div>
      {pct !== null && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[color:var(--color-border-dim)]">
          <div
            className="h-full rounded-[var(--radius-pill)] bg-[color:var(--color-accent)] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {caption && (
        <p className="mt-2 font-mono text-[11px] text-[color:var(--color-text-fade)]">{caption}</p>
      )}
    </section>
  );
}
