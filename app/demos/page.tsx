import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllDemos, getDemoCategories } from '@/lib/demos';

/**
 * F1.1 minimal restyle. The shipped-vs-planned + URL-synced category filter
 * rebuild is REQ-AVA-DEMOS-001 and deferred to F1.2. This pass only ensures
 * the index renders cleanly under the new dark + cyan tokens.
 */
export const metadata: Metadata = {
  title: 'Demos · voice playground',
  description:
    'Voice agent demos from the awesome-voice-apps cookbook. Pick one, paste your provider keys, talk to it.',
};

const ALL_FILTER = '__all__';

interface DemosPageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

function pickCategory(raw: string | string[] | undefined): string | null {
  if (!raw) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value !== ALL_FILTER ? value : null;
}

export default async function DemosIndexPage({ searchParams }: DemosPageProps) {
  const { category: rawCategory } = await searchParams;
  const activeCategory = pickCategory(rawCategory);

  const allDemos = getAllDemos();
  const categories = getDemoCategories();
  const visible = activeCategory ? allDemos.filter((d) => d.category === activeCategory) : allDemos;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
            · DEMOS · {allDemos.length} SHIPPED
            {activeCategory ? ` · ${activeCategory}` : ''}
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[color:var(--color-text)]">
            Demos
          </h1>
          <p className="mt-2 max-w-[60ch] text-[14px] text-[color:var(--color-text-dim)]">
            Voice agents you can talk to in the browser. Bring your own provider keys, pick a card,
            run the agent locally, start the call.
          </p>
        </div>
        {categories.length > 0 ? (
          <nav
            aria-label="Filter by category"
            className="flex max-w-md flex-wrap items-center justify-end gap-2"
          >
            <CategoryChip label="all" href="/demos" active={activeCategory === null} />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                href={`/demos?category=${encodeURIComponent(cat)}`}
                active={activeCategory === cat}
              />
            ))}
          </nav>
        ) : null}
      </header>

      <section aria-label="Demo list" className="mt-10">
        {visible.length === 0 ? (
          <EmptyState activeCategory={activeCategory} totalDemos={allDemos.length} />
        ) : (
          <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((demo) => (
              <li key={demo.slug}>
                <Link
                  href={`/demos/${demo.slug}`}
                  className="block h-full rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-accent)]"
                >
                  <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
                    {demo.category}
                  </p>
                  <h3 className="mt-1.5 text-[16px] font-semibold tracking-tight text-[color:var(--color-text)]">
                    {demo.title}
                  </h3>
                  {demo.card_stat ? (
                    <p className="mt-1 font-mono text-[11px] text-[color:var(--color-accent)]">
                      {demo.card_stat}
                    </p>
                  ) : null}
                  <p className="mt-3 text-[12.5px] text-[color:var(--color-text-mute)]">
                    {demo.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {activeCategory ? (
          <div className="mt-6">
            <Link
              href="/demos"
              className="font-mono text-[10.5px] tracking-[0.06em] text-[color:var(--color-text-mute)] uppercase underline-offset-4 hover:underline"
            >
              · clear filter
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

interface CategoryChipProps {
  label: string;
  href: string;
  active: boolean;
}

function CategoryChip({ label, href, active }: CategoryChipProps) {
  const classes = active
    ? 'bg-[color:var(--color-accent)] text-black border-[color:var(--color-accent)]'
    : 'border-[color:var(--color-border)] text-[color:var(--color-text-mute)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text)]';
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex items-center rounded-[var(--radius-pill)] border px-3 py-1 font-mono text-[10.5px] tracking-[0.08em] uppercase transition-colors ${classes}`}
    >
      {label}
    </Link>
  );
}

interface EmptyStateProps {
  activeCategory: string | null;
  totalDemos: number;
}

function EmptyState({ activeCategory, totalDemos }: EmptyStateProps) {
  if (activeCategory) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-6 text-[13px] text-[color:var(--color-text-mute)]">
        No demos in category <b className="text-[color:var(--color-text-dim)]">{activeCategory}</b>{' '}
        yet.{' '}
        <Link href="/demos" className="text-[color:var(--color-accent)] hover:underline">
          See all
        </Link>
        .
      </div>
    );
  }
  if (totalDemos === 0) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-6 text-[13px] text-[color:var(--color-text-mute)]">
        No shipped demos yet. Demos live in the{' '}
        <a
          href="https://github.com/mahimairaja/awesome-voice-apps"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[color:var(--color-accent)] hover:underline"
        >
          awesome-voice-apps cookbook ↗
        </a>{' '}
        and appear here once they ship a{' '}
        <code className="font-mono text-[12px] text-[color:var(--color-text-dim)]">
          playground.json
        </code>
        .
      </div>
    );
  }
  return null;
}
