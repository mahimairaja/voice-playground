import { Suspense } from 'react';
import Link from 'next/link';
import { Btn, Eyebrow, Reveal } from '@/components/phosphor';
import { CatalogError } from '@/components/playground/CatalogError';
import { CookbookSourceLink } from '@/components/playground/CookbookSourceLink';
import { NewBadge } from '@/components/playground/NewBadge';
import { StackLine } from '@/components/playground/StackLine';
import { UpvoteButton } from '@/components/playground/UpvoteButton';
import { Skeleton } from '@/components/ui/skeleton';
import { CatalogFetchError } from '@/lib/cookbook/manifest';
import { COOKBOOK_BASE_URL } from '@/lib/cookbook/url';
import { type PlannedDemo, type ShippedDemo, getAllPlanned, getAllShipped } from '@/lib/demos';
import { isRecentlyReleased } from '@/lib/demos/released';
import { HeroScope } from './HeroScope';

/**
 * Landing page, clean-light teal skin. Layout:
 *   hero left (badge + headline + lead + CTA row) · scope panel right ·
 *   featured demos trio (Suspense-streamed) · how-it-works trio · byo note.
 *
 * The featured row fills with up to 3 shipped demos. If shipped count is
 * below 3, planned cards fill the remainder. If the catalog fetch fails the
 * row shows '<CatalogError compact />'.
 */
export default function HomePage() {
  return (
    <>
      <main className="animate-page-enter mx-auto max-w-[1140px] px-8 pt-14 pb-4">
        <section aria-label="Hero" className="grid items-start gap-11 md:grid-cols-[1.25fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-dim)]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]"
              />
              <span className="shiny-text">voice agents · live demos</span>
            </span>
            <h1 className="mt-5 text-5xl leading-[1.04] font-black tracking-tight text-[color:var(--color-text)] sm:text-6xl">
              Stop reading about voice agents.
              <br />
              <span className="bg-gradient-to-r from-[color:var(--color-accent-dim)] to-[color:var(--color-accent)] bg-clip-text text-transparent">
                Talk to one.
              </span>
            </h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-[color:var(--color-text-dim)]">
              Open-source voice agents you run locally and talk to right here. Your keys, your
              machine, nothing stored.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Btn kind="primary" href="/demos" className="btn-shine">
                Open demos
              </Btn>
              <Btn kind="ghost" href="/about">
                How it works
              </Btn>
            </div>
          </div>

          <HeroScope />
        </section>

        <section aria-labelledby="try-one" className="mt-[60px]">
          <Reveal className="flex items-baseline justify-between">
            <Eyebrow>
              <span id="try-one">try one</span>
            </Eyebrow>
            <Link
              href="/demos"
              className="text-sm font-semibold text-[color:var(--color-accent-dim)] hover:underline"
            >
              All demos →
            </Link>
          </Reveal>
          <Suspense
            fallback={
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[190px] rounded-[var(--radius-panel)]" />
                ))}
              </div>
            }
          >
            <FeaturedRow />
          </Suspense>
        </section>

        <section
          aria-label="How it works"
          className="mt-14 border-t border-[color:var(--color-border-dim)] pt-9"
        >
          <Reveal>
            <Eyebrow>how it works</Eyebrow>
          </Reveal>
          <div className="mt-[18px] grid grid-cols-1 gap-4 md:grid-cols-3">
            <Reveal>
              <Step
                number="01"
                title="Run the agent"
                body="Clone the cookbook, cd into a demo, run it."
              />
            </Reveal>
            <Reveal delay={0.08}>
              <Step
                number="02"
                title="Paste your keys"
                body="LiveKit URL, key, and secret. They stay in your browser."
              />
            </Reveal>
            <Reveal delay={0.16}>
              <Step
                number="03"
                title="Talk to the agent"
                body="Pick the demo here and start the call."
              />
            </Reveal>
          </div>
        </section>

        <section
          aria-label="Bring your own keys"
          className="mt-10 border-t border-[color:var(--color-border-dim)] pt-[22px] pb-14"
        >
          <Eyebrow>bring your own keys</Eyebrow>
          <p className="mt-[10px] max-w-[66ch] text-[14px] leading-[1.6] text-[color:var(--color-text-mute)]">
            No account. No server with your secrets on it. Your LiveKit key mints a token in the
            browser; your OpenAI and Deepgram keys never leave your machine, they sit in the
            agent&apos;s <code className="font-mono text-[color:var(--color-text-dim)]">.env</code>.
            <br />
            Cookbook&apos;s open source:{' '}
            <a
              href={COOKBOOK_BASE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[color:var(--color-accent-dim)] hover:underline"
            >
              awesome-voice-apps ↗
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}

/**
 * The catalog-dependent slice of the landing page, isolated behind Suspense
 * so the hero streams immediately while the cookbook fetch resolves.
 */
async function FeaturedRow() {
  let shipped: readonly ShippedDemo[] = [];
  let catalogError: CatalogFetchError | null = null;
  try {
    shipped = await getAllShipped();
  } catch (err) {
    if (err instanceof CatalogFetchError) catalogError = err;
    else throw err;
  }

  const planned = getAllPlanned();
  const featuredShipped = shipped.slice(0, 3);
  const fillCount = Math.max(0, 3 - featuredShipped.length);
  const featuredPlanned = planned.slice(0, fillCount);

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      {catalogError ? (
        <div className="md:col-span-3">
          <CatalogError cause={catalogError.cause} compact />
        </div>
      ) : featuredShipped.length === 0 && featuredPlanned.length === 0 ? (
        <p className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-4 text-[14px] text-[color:var(--color-text-mute)] md:col-span-3">
          No demos shipped yet. Track them in the{' '}
          <a
            href={COOKBOOK_BASE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[color:var(--color-accent-dim)] hover:underline"
          >
            awesome-voice-apps cookbook ↗
          </a>
          .
        </p>
      ) : (
        <>
          {featuredShipped.map((demo, i) => (
            <Reveal key={demo.slug} delay={i * 0.08} className="h-full">
              <ShippedCard demo={demo} />
            </Reveal>
          ))}
          {featuredPlanned.map((demo, i) => (
            <Reveal key={demo.slug} delay={(featuredShipped.length + i) * 0.08} className="h-full">
              <PlannedCard demo={demo} />
            </Reveal>
          ))}
        </>
      )}
    </div>
  );
}

function ShippedCard({ demo }: { demo: ShippedDemo }) {
  return (
    <div className="card card-hover relative flex h-full flex-col p-6">
      {/* Stretched link makes the whole card a click target without nesting the source anchor inside it. */}
      <Link
        href={`/demos/${demo.slug}`}
        aria-label={`Open ${demo.title}`}
        className="absolute inset-0 z-0 rounded-[var(--radius-card)]"
      />
      <span className="inline-flex items-center gap-2">
        <span className="badge">{demo.category}</span>
        {isRecentlyReleased(demo.released, new Date()) ? <NewBadge /> : null}
      </span>
      <h3 className="mt-4 text-xl leading-tight font-bold tracking-tight text-[color:var(--color-text)]">
        {demo.title}
      </h3>
      <div className="flex-1">
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-text-dim)]">
          {demo.description}
        </p>
        <StackLine stack={demo.stack} />
      </div>
      <div className="relative z-10 mt-5 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-4">
        <div className="flex items-center gap-2.5">
          <UpvoteButton slug={demo.slug} />
          <CookbookSourceLink slug={demo.slug} variant="inline" />
        </div>
        <span className="text-sm font-semibold text-[color:var(--color-accent-dim)]">Play →</span>
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
      className="card flex h-full flex-col p-6"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <span className="badge">{demo.category}</span>
          <span className="inline-flex items-center rounded-full bg-[color:var(--color-surface-3)] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[color:var(--color-text-mute)] uppercase">
            planned
          </span>
        </span>
      </div>
      <h3 className="mt-4 text-xl leading-tight font-bold tracking-tight text-[color:var(--color-text-dim)]">
        {demo.title}
      </h3>
      <p className="mt-2 flex-1 text-[15px] leading-[1.6] text-[color:var(--color-text-mute)]">
        {demo.why}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-4 text-xs font-medium text-[color:var(--color-text-mute)]">
        <span>Source ↗</span>
        <span>Target {demo.target_date}</span>
      </div>
    </a>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="card card-hover p-6">
      <Eyebrow accent>{number}</Eyebrow>
      <h3 className="mt-3 text-lg font-bold tracking-tight text-[color:var(--color-text)]">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-[1.55] text-[color:var(--color-text-dim)]">{body}</p>
    </div>
  );
}
