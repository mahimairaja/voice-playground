import { cn } from '@/lib/shadcn/utils';

export interface CostLine {
  label: string;
  value: string;
  sublabel?: string;
}

export interface CostPanelProps {
  total_usd: number;
  lines: CostLine[];
  className?: string;
}

function formatTotal(total: number): string {
  if (total < 1) return `$${total.toFixed(3)}`;
  return `$${total.toFixed(2)}`;
}

export function CostPanel({ total_usd, lines, className }: CostPanelProps) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3.5',
        className
      )}
    >
      <ul className="flex flex-col gap-1.5">
        {lines.map((line, i) => (
          <li key={`${line.label}-${i}`} className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] text-[color:var(--color-text-mute)]">
              {line.label}
              {line.sublabel && (
                <span className="ml-2 font-mono text-[10px] tracking-[0.06em] text-[color:var(--color-text-fade)] lowercase">
                  {line.sublabel}
                </span>
              )}
            </span>
            <span className="font-mono text-[13px] font-medium text-[color:var(--color-text-dim)]">
              {line.value}
            </span>
          </li>
        ))}
      </ul>
      <div
        className="mt-2.5 flex items-center justify-between rounded-[8px] bg-[color:var(--color-accent)] px-3.5 py-3"
        style={{ color: 'var(--color-text)' }}
      >
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase">total · this call</span>
        <span className="text-[22px] font-bold tabular-nums">{formatTotal(total_usd)}</span>
      </div>
    </section>
  );
}
