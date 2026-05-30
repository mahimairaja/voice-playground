import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, Grain } from '@/components/phosphor';
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
    <Grain>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Eyebrow>
              DEMOS · {shipped.length} SHIPPED · {planned.length} PLANNED
              {activeCategory ? ` · ${activeCategory}` : ''}
            </Eyebrow>
            <h1 className="mt-2.5 text-[34px] leading-none font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
              Channel rack
            </h1>
            <p className="mt-2 max-w-[58ch] text-[14.5px] leading-[1.55] text-[color:var(--color-text-dim)]">
              Voice agents you can talk to in the browser. Paste your LiveKit credentials, pick a
              card, run the agent locally, start the call.
            </p>
          </div>
          {categories.length > 1 ? (
            <nav
              aria-label="Filter by category"
              className="flex max-w-[460px] flex-wrap items-center justify-end gap-2"
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

        <section aria-label="Demo list" className="mt-8">
          {catalogError ? (
            <CatalogError cause={catalogError.cause} />
          ) : visibleShipped.length + visiblePlanned.length === 0 ? (
            <EmptyState
              activeCategory={activeCategory}
              totalShipped={shipped.length}
              totalPlanned={planned.length}
            />
          ) : (
            <ul
              role="list"
              className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
            >
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
            <div className="mt-5">
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
    </Grain>
  );
}

interface CategoryChipProps {
  label: string;
  href: string;
  active: boolean;
}

function CategoryChip({ label, href, active }: CategoryChipProps) {
  const classes = active
    ? 'bg-[color:var(--color-accent)] text-[#1a1200] border-[color:var(--color-accent)]'
    : 'border-[color:var(--color-border)] text-[color:var(--color-text-mute)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text)]';
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex items-center rounded-[var(--radius-pill)] border px-3 py-1.5 font-mono text-[10.5px] tracking-[0.08em] uppercase transition-all ${classes}`}
    >
      {label}
    </Link>
  );
}

function ShippedCard({ demo }: { demo: ShippedDemo }) {
  return (
    <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-[18px] transition-colors hover:border-[color:var(--color-accent)]">
      <Link href={`/demos/${demo.slug}`} className="block flex-1">
        <div className="flex items-center justify-between">
          <Eyebrow className="text-[10px] tracking-[0.08em]">{demo.category}</Eyebrow>
          {demo.card_stat ? (
            <span className="font-mono text-[10px] text-[color:var(--color-accent)]">
              {demo.card_stat}
            </span>
          ) : null}
        </div>
        <h3 className="mt-[13px] text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--color-text)]">
          {demo.title}
        </h3>
        <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--color-text-mute)]">
          {demo.description}
        </p>
      </Link>
      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-[13px]">
        <CookbookSourceLink slug={demo.slug} variant="inline" />
        <Link
          href={`/demos/${demo.slug}`}
          className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-accent)] uppercase hover:underline"
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
      className="flex h-full flex-col rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border-dim)] bg-[color:var(--color-surface)] p-[18px] opacity-[0.72] transition-opacity hover:opacity-100"
    >
      <div className="flex items-center justify-between">
        <Eyebrow className="text-[10px] tracking-[0.08em]">{demo.category} · PLANNED</Eyebrow>
      </div>
      <h3 className="mt-[13px] text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--color-text-dim)]">
        {demo.title}
      </h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-[1.55] text-[color:var(--color-text-mute)]">
        {demo.why}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-[13px] font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
        <span className="inline-flex items-center gap-1">
          source <span aria-hidden="true">↗</span>
        </span>
        <span className="text-[color:var(--color-text-mute)]">target {demo.target_date}</span>
      </div>
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
      <div className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-7 font-mono text-[13px] text-[color:var(--color-text-mute)]">
        No demos in <span className="text-[color:var(--color-text-dim)]">{activeCategory}</span>{' '}
        yet.{' '}
        <Link href="/demos" className="text-[color:var(--color-accent)] hover:underline">
          see all
        </Link>
        .
      </div>
    );
  }
  if (totalShipped === 0 && totalPlanned === 0) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-7 font-mono text-[13px] text-[color:var(--color-text-mute)]">
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
