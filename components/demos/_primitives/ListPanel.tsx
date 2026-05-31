import Link from 'next/link';
import { cn } from '@/lib/shadcn/utils';

export interface ListItem {
  title: string;
  subtitle?: string;
  right?: string;
  image_url?: string;
  href?: string;
}

export interface ListPanelProps {
  title?: string;
  items: ListItem[];
  className?: string;
}

export function ListPanel({ title, items, className }: ListPanelProps) {
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
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => {
          const inner = (
            <div className="flex items-center gap-3">
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt=""
                  className="block h-11 w-11 flex-none rounded-[4px] border border-[color:var(--color-border)] object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-[14px] leading-tight font-semibold text-[color:var(--color-text)]">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="mt-0.5 text-[12px] text-[color:var(--color-text-mute)]">
                    {item.subtitle}
                  </p>
                )}
              </div>
              {item.right && (
                <span className="flex-none font-mono text-[12px] font-medium text-[color:var(--color-text-dim)] tabular-nums">
                  {item.right}
                </span>
              )}
            </div>
          );

          return (
            <li
              key={`${item.title}-${i}`}
              className={cn(i > 0 && 'border-t border-[color:var(--color-border-dim)] pt-2')}
            >
              {item.href ? (
                <Link href={item.href} className="block transition-opacity hover:opacity-80">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
