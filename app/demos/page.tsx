import type { Metadata } from 'next';
import Link from 'next/link';
import { CatalogError } from '@/components/playground/CatalogError';
import { CookbookSourceLink } from '@/components/playground/CookbookSourceLink';
import { CatalogFetchError } from '@/lib/cookbook/manifest';
import {
  type PlannedDemo,
  type ShippedDemo,
  getAllPlanned,
  getAllShipped,
  getDemoCategories,
} from '@/lib/demos';

/**
 * F1.2 demos-index rebuild. Renders shipped + planned cards together,
 * filtered by an optional '?category=' URL param. Explicit '<CatalogError>'
 * when the cookbook fetch fails. No reference-seed fallback; missing data
 * is an honest signal.
 */

export const metadata: Metadata = {
  title: 'Demos · voice playground',
  description:
    'Voice agent demos from the awesome-voice-apps cookbook. Pick one, paste your LiveKit credentials, talk to it.',
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

  let shipped: readonly ShippedDemo[] = [];
  let categories: readonly string[] = [];
  let catalogError: CatalogFetchError | null = null;
  try {
    [shipped, categories] = await Promise.all([getAllShipped(), getDemoCategories()]);
  } catch (err) {
    if (err instanceof CatalogFetchError) catalogError = err;
    else throw err;
  }
  const planned = getAllPlanned();

  const visibleShipped = activeCategory
    ? shipped.filter((d) => d.category === activeCategory)
    : shipped;
  const visiblePlanned = activeCategory
    ? planned.filter((d) => d.category === activeCategory)
    : planned;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
            DEMOS · {shipped.length} SHIPPED · {planned.length} PLANNED
            {activeCategory ? ` · ${activeCategory}` : ''}
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[color:var(--color-text)]">
            Demos
          </h1>
          <p className="mt-2 max-w-[60ch] text-[14px] text-[color:var(--color-text-dim)]">
            Voice agents you can talk to in the browser. Paste your LiveKit credentials, pick a
            card, run the agent locally, start the call.
          </p>
        </div>
        {categories.length > 1 ? (
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
        {catalogError ? (
          <CatalogError cause={catalogError.cause} />
        ) : visibleShipped.length + visiblePlanned.length === 0 ? (
          <EmptyState
            activeCategory={activeCategory}
            totalShipped={shipped.length}
            totalPlanned={planned.length}
          />
        ) : (
          <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleShipped.map((demo) => (
              <li key={demo.slug}>
                <ShippedCard demo={demo} />
              </li>
            ))}
            {visiblePlanned.map((demo) => (
              <li key={demo.slug}>
                <PlannedCard demo={demo} />
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
    ? 'bg-[color:var(--color-accent)] text-[color:var(--color-bg)] border-[color:var(--color-accent)]'
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

function ShippedCard({ demo }: { demo: ShippedDemo }) {
  return (
    <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-accent)]">
      <Link href={`/demos/${demo.slug}`} className="block flex-1">
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
        <p className="mt-3 text-[12.5px] text-[color:var(--color-text-mute)]">{demo.description}</p>
      </Link>
      <div className="mt-3 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-3">
        <CookbookSourceLink slug={demo.slug} variant="inline" />
        <Link
          href={`/demos/${demo.slug}`}
          className="font-mono text-[10px] tracking-[0.06em] text-[color:var(--color-accent)] uppercase hover:underline"
        >
          ▶ play
        </Link>
      </div>
    </div>
  );
}

function PlannedCard({ demo }: { demo: PlannedDemo }) {
  return (
    <a
      href={demo.github_link}
      target="_blank"
      rel="noreferrer noopener"
      className="flex h-full flex-col rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 opacity-70 transition-opacity hover:opacity-100"
    >
      <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
        {demo.category} · PLANNED
      </p>
      <h3 className="mt-1.5 text-[16px] font-semibold tracking-tight text-[color:var(--color-text-dim)]">
        {demo.title}
      </h3>
      <p className="mt-1 font-mono text-[10px] tracking-[0.06em] text-[color:var(--color-text-mute)] uppercase">
        target {demo.target_date}
      </p>
      <p className="mt-3 text-[12.5px] text-[color:var(--color-text-mute)]">{demo.why}</p>
    </a>
  );
}

interface EmptyStateProps {
  activeCategory: string | null;
  totalShipped: number;
  totalPlanned: number;
}

function EmptyState({ activeCategory, totalShipped, totalPlanned }: EmptyStateProps) {
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
  if (totalShipped === 0 && totalPlanned === 0) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-6 text-[13px] text-[color:var(--color-text-mute)]">
        No demos yet. New ones land in the{' '}
        <a
          href="https://github.com/mahimairaja/awesome-voice-apps"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[color:var(--color-accent)] hover:underline"
        >
          awesome-voice-apps cookbook ↗
        </a>
        .
      </div>
    );
  }
  return null;
}
