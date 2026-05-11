import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllDemos, getDemoCategories } from '@/lib/demos';
import { cn } from '@/lib/shadcn/utils';

export const metadata: Metadata = {
  title: 'Demos · Mahimai AI playground',
  description: 'Live voice agent demos. Pick one, paste your provider keys, and talk to it.',
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
  const visibleDemos = activeCategory
    ? allDemos.filter((d) => d.category === activeCategory)
    : allDemos;

  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28">
      <header>
        <p className="tiny-mono">
          · the corkboard · {allDemos.length} pinned
          {activeCategory ? ` · ${activeCategory}` : ''}
        </p>
        <h1 className="h-hand xxl mt-3 leading-[0.95]">
          Pick a demo.
          <br />
          <span style={{ color: 'var(--accent-hex)' }}>Talk to it.</span>
        </h1>
        <p className="p-hand mt-4 max-w-xl">
          Live voice agents you can talk to in the browser. Bring your own provider keys (we never
          see them), pick a card off the board, start the call.
        </p>
      </header>

      {categories.length > 0 && (
        <nav aria-label="Filter by category" className="mt-10">
          <p className="tiny-mono">filter · category</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CategoryChip label="all" href="/demos" active={activeCategory === null} />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                href={`/demos?category=${encodeURIComponent(cat)}`}
                active={activeCategory === cat}
              />
            ))}
          </div>
        </nav>
      )}

      <section aria-label="Demo list" className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <span className="tiny-mono">
            {visibleDemos.length} of {allDemos.length}
            {activeCategory ? ` · ${activeCategory}` : ''}
          </span>
          {activeCategory && (
            <Link href="/demos" className="tiny-mono underline underline-offset-4">
              clear filter
            </Link>
          )}
        </div>
        <div className="line mt-3 mb-6"></div>

        {visibleDemos.length === 0 ? (
          <EmptyState activeCategory={activeCategory} totalDemos={allDemos.length} />
        ) : (
          <ul role="list" className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {visibleDemos.map((demo, i) => {
              const tilt = ((i % 3) - 1) * 1.2;
              const pin =
                i % 3 === 0 ? 'var(--accent-hex)' : i % 3 === 1 ? 'var(--ink)' : '#d4a657';
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
                    className="ab block transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ outlineColor: 'var(--accent-hex)' }}
                  >
                    <div className="ab-head">
                      <span className="label">/demos/{demo.slug}</span>
                      <span className="meta">▶ try</span>
                    </div>
                    <div className="ab-body">
                      <h3 className="h-hand">{demo.title}</h3>
                      <span className="chip" style={{ marginTop: 6 }}>
                        {demo.category}
                      </span>
                      <p className="p-hand sm" style={{ marginTop: 10 }}>
                        {demo.description}
                      </p>
                      {demo.required_credentials.length > 0 && (
                        <p className="tiny-mono" style={{ marginTop: 12 }}>
                          keys · {demo.required_credentials.join(' · ')}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-label="Footer link" className="mt-20">
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
      <div className="box dashed">
        <p className="p-hand">
          Nothing here yet. Demos live in the sibling{' '}
          <a
            href="https://github.com/mahimailabs/awesome-voice-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            awesome-voice-apps
          </a>{' '}
          repo and appear here as soon as one ships a <span className="kbd">playground.json</span>.
        </p>
      </div>
    );
  }

  return null;
}
