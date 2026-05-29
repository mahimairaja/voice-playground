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
        'rounded-[var(--radius-panel)] border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] p-4',
        className
      )}
    >
      <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
        total · this call
      </p>
      <p className="mt-1 font-mono text-[40px] leading-none font-semibold text-[color:var(--color-accent)]">
        {formatTotal(total_usd)}
      </p>
      <div className="my-3 h-px bg-[color:var(--color-border)]" />
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
            <span className="font-mono text-[13px] font-medium text-[color:var(--color-text)]">
              {line.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
