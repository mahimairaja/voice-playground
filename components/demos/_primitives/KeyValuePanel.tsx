/**
 * Generative-UI primitive: labeled list of key/value rows. Label on the left
 * in the hand font, value on the right in mono. The last item renders bold
 * to read as a total. Use it for running totals, address breakdowns, "stack
 * picked" summaries.
 */
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
    <section className={cn('box', className)} style={{ padding: 14 }}>
      {title && (
        <p className="tiny-mono" style={{ marginBottom: 8 }}>
          {title}
        </p>
      )}
      <dl className="flex flex-col gap-2">
        {items.map((item, i) => {
          const isLast = i === lastIndex && items.length > 1;
          return (
            <div key={`${item.label}-${i}`} className="flex items-baseline justify-between gap-3">
              <dt
                className="p-hand sm"
                style={{
                  color: item.accent ? 'var(--accent-hex)' : 'var(--ink-2)',
                  fontWeight: isLast ? 700 : 400,
                }}
              >
                {item.label}
              </dt>
              <dd
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: isLast ? 14 : 12,
                  fontWeight: isLast ? 700 : 500,
                  color: item.accent ? 'var(--accent-hex)' : 'var(--ink)',
                }}
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
