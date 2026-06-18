import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow } from '@/components/phosphor';
import { CatalogError } from '@/components/playground/CatalogError';
import { CookbookSourceLink } from '@/components/playground/CookbookSourceLink';
import { NewBadge } from '@/components/playground/NewBadge';
import { StackLine } from '@/components/playground/StackLine';
import { UpvoteButton } from '@/components/playground/UpvoteButton';
import { CatalogFetchError } from '@/lib/cookbook/manifest';
import {
  type PlannedDemo,
  type ShippedDemo,
  getAllPlanned,
  getAllShipped,
  getDemoCategories,
  getDemoProviders,
} from '@/lib/demos';
import { isRecentlyReleased } from '@/lib/demos/released';
import { demoUsesProvider } from '@/lib/demos/stack';

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
  searchParams: Promise<{ category?: string | string[]; provider?: string | string[] }>;
}

function pickParam(raw: string | string[] | undefined): string | null {
  if (!raw) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value !== ALL_FILTER ? value : null;
}

// Build a /demos href that keeps the other active filter, so the two
// dimensions (category and stack) compose instead of clobbering each other.
function filterHref(category: string | null, provider: string | null): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (provider) params.set('provider', provider);
  const qs = params.toString();
  return qs ? `/demos?${qs}` : '/demos';
}

export default async function DemosIndexPage({ searchParams }: DemosPageProps) {
  const { category: rawCategory, provider: rawProvider } = await searchParams;
  const activeCategory = pickParam(rawCategory);
  const activeProvider = pickParam(rawProvider);

  let shipped: readonly ShippedDemo[] = [];
  let categories: readonly string[] = [];
  let providers: readonly string[] = [];
  let catalogError: CatalogFetchError | null = null;
  try {
    [shipped, categories, providers] = await Promise.all([
      getAllShipped(),
      getDemoCategories(),
      getDemoProviders(),
    ]);
  } catch (err) {
    if (err instanceof CatalogFetchError) catalogError = err;
    else throw err;
  }
  const planned = getAllPlanned();

  const visibleShipped = shipped.filter(
    (d) =>
      (!activeCategory || d.category === activeCategory) &&
      (!activeProvider || demoUsesProvider(d.stack, activeProvider))
  );
  // Planned demos carry no stack, so a provider filter hides them.
  const visiblePlanned = activeProvider
    ? []
    : activeCategory
      ? planned.filter((d) => d.category === activeCategory)
      : planned;

  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <header>
          <Eyebrow>
            DEMOS · {shipped.length} SHIPPED · {planned.length} PLANNED
            {activeCategory ? ` · ${activeCategory}` : ''}
          </Eyebrow>
          <h1 className="mt-2.5 text-[34px] leading-none font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
            Demos
          </h1>
          <p className="mt-2 max-w-[58ch] text-[14.5px] leading-[1.55] text-[color:var(--color-text-dim)]">
            Voice agents you can talk to in your browser. Run one locally, paste your LiveKit keys,
            start the call.
          </p>
        </header>

        {categories.length > 1 ? (
          <nav aria-label="Filter by category" className="mt-6 flex flex-wrap items-center gap-1.5">
            <FilterLabel>category</FilterLabel>
            <CategoryChip
              label="all"
              href={filterHref(null, activeProvider)}
              active={activeCategory === null}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                href={filterHref(cat, activeProvider)}
                active={activeCategory === cat}
              />
            ))}
          </nav>
        ) : null}

        {providers.length > 1 ? (
          <nav aria-label="Filter by provider" className="mt-2 flex flex-wrap items-center gap-1.5">
            <FilterLabel>stack</FilterLabel>
            <CategoryChip
              label="all"
              href={filterHref(activeCategory, null)}
              active={activeProvider === null}
            />
            {providers.map((prov) => (
              <CategoryChip
                key={prov}
                label={prov}
                href={filterHref(activeCategory, prov)}
                active={activeProvider === prov}
              />
            ))}
          </nav>
        ) : null}

        <section aria-label="Demo list" className="mt-8">
          {catalogError ? (
            <CatalogError cause={catalogError.cause} />
          ) : visibleShipped.length + visiblePlanned.length === 0 ? (
            <EmptyState
              filtered={Boolean(activeCategory || activeProvider)}
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

          {activeCategory || activeProvider ? (
            <div className="mt-5">
              <Link
                href="/demos"
                className="font-mono text-[11px] tracking-[0.06em] text-[color:var(--color-text-mute)] uppercase underline-offset-4 hover:underline"
              >
                · clear filters
              </Link>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}

interface CategoryChipProps {
  label: string;
  href: string;
  active: boolean;
}

function CategoryChip({ label, href, active }: CategoryChipProps) {
  // Inline filter chips on URL-driven links: filters stay shareable and
  // server-rendered (deliberately not Tabs). The active chip takes the amber
  // fill; the rest are quiet lowercase text until hovered.
  const classes = active
    ? 'bg-[color:var(--color-accent)] font-semibold text-[color:var(--color-text)]'
    : 'text-[color:var(--color-text-mute)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]';
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-1.5 font-mono text-[12px] lowercase transition-colors ${classes}`}
    >
      {label}
    </Link>
  );
}

function FilterLabel({ children }: { children: string }) {
  return (
    <span className="mr-1 font-mono text-[10px] tracking-[0.12em] text-[color:var(--color-text-fade)] uppercase">
      {children}
    </span>
  );
}

function ShippedCard({ demo }: { demo: ShippedDemo }) {
  return (
    <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-[18px] transition-colors hover:border-[color:var(--color-accent)]">
      <Link href={`/demos/${demo.slug}`} className="block flex-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <Eyebrow accent className="text-[11px] tracking-[0.08em]">
              {demo.category}
            </Eyebrow>
            {isRecentlyReleased(demo.released, new Date()) ? <NewBadge /> : null}
          </span>
          {demo.card_stat ? (
            <span className="font-mono text-[11px] text-[color:var(--color-text-mute)]">
              {demo.card_stat}
            </span>
          ) : null}
        </div>
        <h3 className="mt-[13px] text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--color-text)]">
          {demo.title}
        </h3>
        <p className="mt-2 text-[14.5px] leading-[1.6] text-[color:var(--color-text-dim)]">
          {demo.description}
        </p>
        <StackLine stack={demo.stack} />
      </Link>
      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-[13px]">
        <div className="flex items-center gap-2.5">
          <UpvoteButton slug={demo.slug} />
          <CookbookSourceLink slug={demo.slug} variant="inline" />
        </div>
        <Link
          href={`/demos/${demo.slug}`}
          className="font-mono text-[11px] font-semibold tracking-[0.08em] text-[color:var(--color-accent-dim)] uppercase hover:underline"
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
        <Eyebrow className="text-[11px] tracking-[0.08em]">{demo.category} · PLANNED</Eyebrow>
      </div>
      <h3 className="mt-[13px] text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--color-text-dim)]">
        {demo.title}
      </h3>
      <p className="mt-2 flex-1 text-[14.5px] leading-[1.6] text-[color:var(--color-text-mute)]">
        {demo.why}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-[13px] font-mono text-[11px] tracking-[0.08em] text-[color:var(--color-text-mute)] uppercase">
        <span className="inline-flex items-center gap-1">
          source <span aria-hidden="true">↗</span>
        </span>
        <span className="text-[color:var(--color-text-mute)]">target {demo.target_date}</span>
      </div>
    </a>
  );
}

interface EmptyStateProps {
  filtered: boolean;
  totalShipped: number;
  totalPlanned: number;
}

function EmptyState({ filtered, totalShipped, totalPlanned }: EmptyStateProps) {
  if (filtered) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-7 font-mono text-[13px] text-[color:var(--color-text-mute)]">
        No demos match this filter.{' '}
        <Link href="/demos" className="text-[color:var(--color-accent-dim)] hover:underline">
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
          className="text-[color:var(--color-accent-dim)] hover:underline"
        >
          awesome-voice-apps cookbook ↗
        </a>
        .
      </div>
    );
  }
  return null;
}
