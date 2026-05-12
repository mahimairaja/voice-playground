/**
 * Generative-UI primitive: vertical list of titled rows. Each row has a
 * title, optional subtitle, optional right-side text, optional thumbnail, and
 * an optional href that turns the row into a link. Useful for order
 * line-items, listings, search results.
 */
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
    <section className={cn('box', className)} style={{ padding: 14 }}>
      {title && (
        <p className="tiny-mono" style={{ marginBottom: 8 }}>
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
                  className="block flex-none rounded-[4px]"
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: 'cover',
                    border: '1px solid var(--line-soft)',
                  }}
                />
              )}
              <div className="flex-1">
                <p
                  style={{
                    fontFamily: 'var(--hand-title)',
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1.1,
                  }}
                >
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="p-hand sm" style={{ marginTop: 2, color: 'var(--ink-2)' }}>
                    {item.subtitle}
                  </p>
                )}
              </div>
              {item.right && (
                <span
                  className="flex-none"
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}
                >
                  {item.right}
                </span>
              )}
            </div>
          );

          return (
            <li
              key={`${item.title}-${i}`}
              style={{
                borderTop: i > 0 ? '1px dashed var(--line-soft)' : 'none',
                paddingTop: i > 0 ? 8 : 0,
              }}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="block transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ outlineColor: 'var(--accent-hex)' }}
                >
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
