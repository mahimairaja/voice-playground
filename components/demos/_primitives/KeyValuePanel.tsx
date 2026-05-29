import { cn } from '@/lib/shadcn/utils';

export interface KeyValueItem {
  label: string;
  value: string;
  accent?: boolean;
}

export interface KeyValuePanelProps {
  title?: string;
  items: KeyValueItem[];
  className?: string;
}

export function KeyValuePanel({ title, items, className }: KeyValuePanelProps) {
  const lastIndex = items.length - 1;

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
      <dl className="flex flex-col gap-2">
        {items.map((item, i) => {
          const isLast = i === lastIndex && items.length > 1;
          return (
            <div key={`${item.label}-${i}`} className="flex items-baseline justify-between gap-3">
              <dt
                className={cn(
                  'text-[13px]',
                  item.accent
                    ? 'text-[color:var(--color-accent)]'
                    : 'text-[color:var(--color-text-dim)]',
                  isLast && 'font-semibold'
                )}
              >
                {item.label}
              </dt>
              <dd
                className={cn(
                  'font-mono',
                  isLast ? 'text-[14px] font-semibold' : 'text-[12px] font-medium',
                  item.accent
                    ? 'text-[color:var(--color-accent)]'
                    : 'text-[color:var(--color-text)]'
                )}
              >
                {item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
