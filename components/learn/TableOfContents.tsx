'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/cookbook/toc';

/**
 * The tutorial sidebar table of contents, with a scroll-spy active state. Ids
 * come from lib/cookbook/toc.extractToc and match rehype-slug's heading ids, so
 * the anchors resolve and the observer tracks the right sections.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActive(topmost.target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mb-3 font-mono text-[11px] font-semibold tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
        On this page
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={[
                'block py-0.5 transition-colors',
                item.depth === 3 ? 'pl-4' : '',
                active === item.id
                  ? 'font-medium text-[color:var(--color-accent-dim)]'
                  : 'text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]',
              ].join(' ')}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
