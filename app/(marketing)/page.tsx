import Link from 'next/link';
import { CatalogError } from '@/components/playground/CatalogError';
import { CookbookSourceLink } from '@/components/playground/CookbookSourceLink';
import { CatalogFetchError } from '@/lib/cookbook/manifest';
import { COOKBOOK_BASE_URL } from '@/lib/cookbook/url';
import { type PlannedDemo, type ShippedDemo, getAllPlanned, getAllShipped } from '@/lib/demos';

/**
 * F1.2 landing rebuild. Layout A (per spec):
 *   hero left (headline + lead + CTA row) · 3-card column right · how-it-works
 *   trio below.
 *
 * The right column fills with up to 3 shipped demos. If shipped count is
 * below 3, planned cards fill the remainder. If the catalog fetch fails the
 * column shows '<CatalogError compact />'.
 */
export default async function HomePage() {
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
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section aria-label="Hero" className="grid items-start gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
            {'// VOICE PLAYGROUND'}
          </p>
          <h1 className="mt-3 text-[42px] leading-[1.05] font-semibold tracking-tight text-[color:var(--color-text)]">
            Talk to a voice agent. <br />
            <span className="text-[color:var(--color-accent)]">Not a brochure.</span>
          </h1>
          <p className="mt-5 max-w-[48ch] text-[15px] leading-[1.6] text-[color:var(--color-text-dim)]">
            A browser surface for voice agents from the awesome-voice-apps cookbook. Bring your own
            LiveKit credentials, run the agent locally with{' '}
            <code className="rounded-[var(--radius-input)] bg-[color:var(--color-surface-2)] px-[6px] py-[2px] font-mono text-[12.5px] text-[color:var(--color-text)]">
              uv run python agent.py dev
            </code>
            , talk to it here. Nothing leaves the browser.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/demos"
              className="rounded-[var(--radius-button)] bg-[color:var(--color-accent)] px-4 py-2 text-[13.5px] font-semibold text-[color:var(--color-bg)] hover:opacity-90"
            >
              → Open demos
            </Link>
            <Link
              href="/about"
              className="rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-4 py-2 text-[13.5px] text-[color:var(--color-text)] hover:border-[color:var(--color-border-strong)]"
            >
              How it works
            </Link>
          </div>
        </div>

        <aside aria-labelledby="try-one">
          <p
            id="try-one"
            className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase"
          >
            {'// TRY ONE'}
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {catalogError ? (
              <CatalogError cause={catalogError.cause} compact />
            ) : featuredShipped.length === 0 && featuredPlanned.length === 0 ? (
              <p className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-4 text-[13px] text-[color:var(--color-text-mute)]">
                No demos shipped yet. Track them in the{' '}
                <a
                  href={COOKBOOK_BASE_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[color:var(--color-accent)] hover:underline"
                >
                  awesome-voice-apps cookbook ↗
                </a>
                .
              </p>
            ) : (
              <>
                {featuredShipped.map((demo) => (
                  <ShippedCard key={demo.slug} demo={demo} />
                ))}
                {featuredPlanned.map((demo) => (
                  <PlannedCard key={demo.slug} demo={demo} />
                ))}
              </>
            )}
          </div>
        </aside>
      </section>

      <section
        aria-label="How it works"
        className="mt-20 border-t border-[color:var(--color-border-dim)] pt-10"
      >
        <p className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {'// HOW IT WORKS'}
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Step number="01" title="Paste keys" body="LiveKit URL, API key, and secret." />
          <Step number="02" title="Pick a demo" body="From the awesome-voice-apps cookbook." />
          <Step
            number="03"
            title="Talk to the agent"
            body="Run it locally, then talk to it in your browser."
          />
        </div>
      </section>

      <section
        aria-label="Bring your own keys"
        className="mt-12 border-t border-[color:var(--color-border-dim)] pt-6 text-[12.5px] text-[color:var(--color-text-mute)]"
      >
        <span className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {'// BYO PROVIDERS'}
        </span>
        <p className="mt-2 max-w-[60ch]">
          The playground holds no LiveKit account on your behalf. The visitor brings their own
          LiveKit URL, API key, and secret; the token is minted in the browser. Provider keys
          (OpenAI, Deepgram, etc.) stay in the agent&apos;s .env. The cookbook stays open source:{' '}
          <a
            href={COOKBOOK_BASE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[color:var(--color-accent)] hover:underline"
          >
            awesome-voice-apps ↗
          </a>
          .
        </p>
      </section>
    </main>
  );
}

function ShippedCard({ demo }: { demo: ShippedDemo }) {
  return (
    <Link
      href={`/demos/${demo.slug}`}
      className="block rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-accent)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {demo.category}
        </span>
        <span className="font-mono text-[10px] tracking-[0.06em] text-[color:var(--color-accent)] uppercase">
          ▶ play
        </span>
      </div>
      <h3 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[color:var(--color-text)]">
        {demo.title}
      </h3>
      <p className="mt-1.5 text-[12.5px] text-[color:var(--color-text-mute)]">{demo.description}</p>
      <div className="mt-2">
        <CookbookSourceLink slug={demo.slug} variant="inline" />
      </div>
    </Link>
  );
}

function PlannedCard({ demo }: { demo: PlannedDemo }) {
  return (
    <a
      href={demo.github_link}
      target="_blank"
      rel="noreferrer noopener"
      className="block rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 opacity-70 transition-opacity hover:opacity-100"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {demo.category} · PLANNED
        </span>
        <span className="font-mono text-[10px] tracking-[0.06em] text-[color:var(--color-text-mute)] uppercase">
          {demo.target_date}
        </span>
      </div>
      <h3 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[color:var(--color-text-dim)]">
        {demo.title}
      </h3>
      <p className="mt-1.5 text-[12.5px] text-[color:var(--color-text-mute)]">{demo.why}</p>
    </a>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-[color:var(--color-border-dim)] p-4">
      <span className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-accent)] uppercase">
        {number}
      </span>
      <h3 className="mt-1 text-[14px] font-semibold tracking-tight text-[color:var(--color-text)]">
        {title}
      </h3>
      <p className="mt-1 text-[12.5px] text-[color:var(--color-text-mute)]">{body}</p>
    </div>
  );
}
