import type { Metadata } from 'next';
import Link from 'next/link';
import { getCorkboardCards, getDemoCategories, getPinnedCount } from '@/lib/demos';
import { cn } from '@/lib/shadcn/utils';

export const metadata: Metadata = {
  title: 'Demos · voice playground',
  description:
    'Live voice agent demos from the awesome-voice-apps catalogue. Pick one, paste your provider keys, talk to it.',
};

const ALL_FILTER = '__all__';
const PIN_COLORS = ['var(--accent-hex)', 'var(--ink)', '#d4a657'];

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

  const allCards = getCorkboardCards();
  const pinnedCount = getPinnedCount();
  const categories = getDemoCategories();
  const visibleCards = activeCategory
    ? allCards.filter((card) => card.category === activeCategory)
    : allCards;

  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tiny-mono">
            · demos · {pinnedCount} pinned
            {activeCategory ? ` · ${activeCategory}` : ''}
          </p>
          <h1
            className="mt-2 leading-[0.95]"
            style={{
              fontFamily: 'var(--hand-title)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
            }}
          >
            the corkboard.
          </h1>
        </div>
        {categories.length > 0 && (
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
        )}
      </div>

      <p className="p-hand mt-4 max-w-xl text-[14px]">
        live voice agents you can talk to in the browser. bring your own provider keys, pull a card
        off the board, start the call.
      </p>

      <section aria-label="Demo list" className="mt-8">
        {visibleCards.length === 0 ? (
          <EmptyState activeCategory={activeCategory} totalDemos={allCards.length} />
        ) : (
          <div
            style={{
              background:
                'repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,.04) 6px 7px), var(--paper-2)',
              border: '1.5px solid var(--ink)',
              borderRadius: 6,
              padding: 22,
              position: 'relative',
            }}
          >
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-6 gap-y-9 md:grid-cols-2 md:gap-x-7 lg:grid-cols-3"
            >
              {visibleCards.map((card, i) => {
                const tilt = ((i % 3) - 1) * 1.4;
                const pin = PIN_COLORS[i % 3];
                const inner = (
                  <div
                    className="box block transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background: 'var(--paper)',
                      outlineColor: 'var(--accent-hex)',
                      padding: 12,
                    }}
                  >
                    <p className="tiny-mono">{card.category.toUpperCase()}</p>
                    <h3
                      className="mt-1"
                      style={{
                        fontFamily: 'var(--hand-title)',
                        fontSize: 18,
                        fontWeight: 700,
                        lineHeight: 1.05,
                      }}
                    >
                      {card.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Wave bars={12} />
                      <span className="tiny-mono">{card.stat}</span>
                    </div>
                    {card.description && (
                      <p className="p-hand sm" style={{ marginTop: 8 }}>
                        {card.description}
                      </p>
                    )}
                  </div>
                );
                return (
                  <li
                    key={`${card.category}-${card.title}`}
                    style={{ position: 'relative', transform: `rotate(${tilt}deg)` }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        background: pin,
                        border: '1.5px solid var(--ink)',
                        borderRadius: '50%',
                        height: 12,
                        left: '50%',
                        position: 'absolute',
                        top: -7,
                        transform: 'translateX(-50%)',
                        width: 12,
                        zIndex: 2,
                      }}
                    />
                    {card.slug ? (
                      <Link href={`/demos/${card.slug}`}>{inner}</Link>
                    ) : (
                      <div aria-disabled="true">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="tiny-mono">· corkboard {pinnedCount} pinned.</p>
              <p className="tiny-mono">pin count follows the reference board.</p>
            </div>
            {activeCategory && (
              <div className="mt-6 flex justify-end">
                <Link href="/demos" className="tiny-mono underline underline-offset-4">
                  · clear filter
                </Link>
              </div>
            )}
          </div>
        )}
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
  return (
    <Link
      href={href}
      className={cn('chip', active && 'accent brand-accent')}
      aria-current={active ? 'true' : undefined}
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
      <div className="box dashed">
        <p className="p-hand">
          No demos in category <b>{activeCategory}</b> yet. Try{' '}
          <Link href="/demos" className="underline underline-offset-4">
            all categories
          </Link>
          .
        </p>
      </div>
    );
  }

  if (totalDemos === 0) {
    return (
      <div className="box dashed">
        <p className="tiny-mono">· corkboard · empty for now</p>
        <p className="p-hand mt-2">
          Demos live in the sibling{' '}
          <a
            href="https://github.com/mahimailabs/awesome-voice-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            awesome-voice-apps
          </a>{' '}
          repo and pin themselves here as soon as one ships a{' '}
          <span className="kbd">playground.json</span>.
        </p>
      </div>
    );
  }

  return null;
}

function Wave({ bars = 12 }: { bars?: number }) {
  const heights = [0.3, 0.7, 0.4, 0.9, 0.5, 0.8, 0.35, 0.6, 0.85, 0.45, 0.7, 0.55];
  return (
    <span className="flex h-6 items-end gap-[2px]" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            background: 'var(--accent-hex)',
            borderRadius: 2,
            height: `${Math.round((heights[i % heights.length] ?? 0.5) * 22)}px`,
            opacity: 0.85,
            width: 3,
          }}
        />
      ))}
    </span>
  );
}
