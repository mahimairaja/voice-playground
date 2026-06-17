import { cn } from '@/lib/shadcn/utils';

export type MeterBand = 'good' | 'warn' | 'bad';

export interface MeterItem {
  label: string;
  value: number; // 0..1
  band?: MeterBand; // degradation band; ignored when neutral
  neutral?: boolean; // render as an uncolored level meter (loudness)
  driver?: boolean; // mark as the largest current risk contributor
}

export interface MetersPanelProps {
  title?: string;
  items: MeterItem[];
  className?: string;
}

const BAND_VAR: Record<MeterBand, string> = {
  good: 'var(--color-live)',
  warn: 'var(--color-warning)',
  bad: 'var(--color-danger)',
};

function barColor(item: MeterItem): string {
  if (item.neutral) return 'var(--color-text-mute)';
  return BAND_VAR[item.band ?? 'good'];
}

export function MetersPanel({ title, items, className }: MetersPanelProps) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4',
        className
      )}
    >
      {title && (
        <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {title}
        </p>
      )}
      <div className={cn('flex flex-col gap-3', title && 'mt-3')}>
        {items.map((item) => {
          const value = Number(item.value) || 0;
          const pct = Math.min(100, Math.max(0, Math.round(value * 100)));
          return (
            <div key={item.label} data-meter={item.label}>
              <div className="flex items-baseline justify-between font-mono text-[11px]">
                <span className="text-[color:var(--color-text-dim)]">
                  {item.label}
                  {item.driver && (
                    <span
                      data-driver
                      className="ml-1.5 rounded-[var(--radius-pill)] border border-[color:var(--color-danger)] px-1 text-[9px] tracking-[0.08em] text-[color:var(--color-danger)] uppercase"
                    >
                      driver
                    </span>
                  )}
                  {item.neutral && (
                    <span
                      data-neutral
                      className="ml-1.5 text-[9px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase"
                    >
                      level
                    </span>
                  )}
                </span>
                <span className="text-[color:var(--color-text-mute)] tabular-nums">
                  {value.toFixed(2)}
                </span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[color:var(--color-border-dim)]">
                <div
                  className="h-full rounded-[var(--radius-pill)] transition-[width] duration-300"
                  style={{ width: `${pct}%`, background: barColor(item) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
