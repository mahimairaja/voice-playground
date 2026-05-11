import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllDemos, getDemoCategories } from '@/lib/demos';
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

  const allDemos = getAllDemos();
  const categories = getDemoCategories();
  const visibleDemos = activeCategory
    ? allDemos.filter((d) => d.category === activeCategory)
    : allDemos;

  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tiny-mono">
            · demos · {allDemos.length} pinned
            {activeCategory ? ` · ${activeCategory}` : ''}
          </p>
          <h1
            className="mt-2 leading-[0.95]"
            style={{
              fontFamily: 'var(--hand-title)',
              fontWeight: 700,
              fontSize: 'clamp(36px, 5vw, 56px)',
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
        live voice agents you can talk to in the browser. bring your own provider keys (we never see
        them), pull a card off the board, start the call.
      </p>

      <section aria-label="Demo list" className="mt-8">
        {visibleDemos.length === 0 ? (
          <EmptyState activeCategory={activeCategory} totalDemos={allDemos.length} />
        ) : (
          <div
            style={{
              padding: 22,
              border: '1.5px solid var(--ink)',
              borderRadius: 6,
              background:
                'repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,.04) 6px 7px), var(--paper-2)',
              position: 'relative',
            }}
          >
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-6 gap-y-9 md:grid-cols-2 md:gap-x-7 lg:grid-cols-3"
            >
              {visibleDemos.map((demo, i) => {
                const tilt = ((i % 3) - 1) * 1.4;
                const pin = PIN_COLORS[i % 3];
                return (
                  <li
                    key={demo.slug}
                    style={{ transform: `rotate(${tilt}deg)`, position: 'relative' }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: -7,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: pin,
                        border: '1.5px solid var(--ink)',
                        zIndex: 2,
                      }}
                    />
                    <Link
                      href={`/demos/${demo.slug}`}
                      className="box block transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        background: 'var(--paper)',
                        padding: 12,
                        outlineColor: 'var(--accent-hex)',
                      }}
                    >
                      <p className="tiny-mono">{demo.category.toUpperCase()}</p>
                      <h3
                        className="mt-1"
                        style={{
                          fontFamily: 'var(--hand-title)',
                          fontWeight: 700,
                          fontSize: 18,
                          lineHeight: 1.05,
                        }}
                      >
                        {demo.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Wave bars={12} />
                        <span className="tiny-mono">▶ try</span>
                      </div>
                      <p className="p-hand sm" style={{ marginTop: 8 }}>
                        {demo.description}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
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

      <section aria-label="Footer link" className="mt-16">
        <div className="line soft"></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="p-hand sm max-w-md">
            Looking for the source? Every demo lives in the open-source{' '}
            <a
              href="https://github.com/mahimailabs/awesome-voice-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              awesome-voice-apps
            </a>{' '}
            repo.
          </p>
          <Link href="/about" className="btn">
            Read the about →
          </Link>
        </div>
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
      <div
        style={{
          padding: 30,
          border: '1.5px solid var(--ink)',
          borderRadius: 6,
          background:
            'repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,.04) 6px 7px), var(--paper-2)',
          position: 'relative',
        }}
      >
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
    <span
      aria-hidden="true"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 12 }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 2,
            height: `${heights[i % heights.length] * 100}%`,
            background: 'var(--ink)',
            borderRadius: 1,
          }}
        />
      ))}
    </span>
  );
}
