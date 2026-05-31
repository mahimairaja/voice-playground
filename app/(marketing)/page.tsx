import Link from 'next/link';
import { Btn, Eyebrow, Grain } from '@/components/phosphor';
import { CatalogError } from '@/components/playground/CatalogError';
import { CookbookSourceLink } from '@/components/playground/CookbookSourceLink';
import { CatalogFetchError } from '@/lib/cookbook/manifest';
import { COOKBOOK_BASE_URL } from '@/lib/cookbook/url';
import { type PlannedDemo, type ShippedDemo, getAllPlanned, getAllShipped } from '@/lib/demos';
import { HeroScope } from './HeroScope';

/**
 * F1.2 landing rebuild, PHOSPHOR skin. Layout (per reference):
 *   hero left (eyebrow + headline + lead + CTA row) · scope panel right ·
 *   featured demos trio · how-it-works trio · byo-providers note.
 *
 * The featured row fills with up to 3 shipped demos. If shipped count is
 * below 3, planned cards fill the remainder. If the catalog fetch fails the
 * row shows '<CatalogError compact />'.
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
    <Grain>
      <main className="mx-auto max-w-[1140px] px-8 pt-14">
        <section aria-label="Hero" className="grid items-start gap-11 md:grid-cols-[1.25fr_1fr]">
          <div>
            <Eyebrow>{'// signal acquired · ch.01'}</Eyebrow>
            <h1 className="mt-4 text-[56px] leading-[1.02] font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
              Talk to a voice agent.
              <br />
              <span className="text-[color:var(--color-accent)] [text-shadow:0_0_26px_rgba(255,176,46,0.33)]">
                Not a brochure.
              </span>
            </h1>
            <p className="mt-[22px] max-w-[46ch] text-[16px] leading-[1.62] text-[color:var(--color-text-dim)]">
              A browser oscilloscope for voice agents from the awesome-voice-apps cookbook. Bring
              your own LiveKit credentials, run the agent locally with{' '}
              <code className="rounded-[var(--radius-input)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-[7px] py-[2px] font-mono text-[13px] text-[color:var(--color-accent)]">
                uv run python agent.py dev
              </code>
              , talk to it here. Nothing leaves the browser.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Btn kind="primary" href="/demos">
                ▶ open demos
              </Btn>
              <Btn kind="ghost" href="/about">
                how it works
              </Btn>
            </div>
          </div>

          <HeroScope />
        </section>

        <section aria-labelledby="try-one" className="mt-[60px]">
          <div className="flex items-baseline justify-between">
            <Eyebrow>
              <span id="try-one">{'// try one: channel select'}</span>
            </Eyebrow>
            <Link
              href="/demos"
              className="font-mono text-[11px] text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]"
            >
              all demos →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {catalogError ? (
              <div className="md:col-span-3">
                <CatalogError cause={catalogError.cause} compact />
              </div>
            ) : featuredShipped.length === 0 && featuredPlanned.length === 0 ? (
              <p className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-4 text-[13px] text-[color:var(--color-text-mute)] md:col-span-3">
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
        </section>

        <section
          aria-label="How it works"
          className="mt-14 border-t border-[color:var(--color-border-dim)] pt-9"
        >
          <Eyebrow>{'// how it works'}</Eyebrow>
          <div className="mt-[18px] grid grid-cols-1 gap-4 md:grid-cols-3">
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
          className="mt-10 border-t border-[color:var(--color-border-dim)] pt-[22px]"
        >
          <Eyebrow>{'// byo providers'}</Eyebrow>
          <p className="mt-[10px] max-w-[66ch] text-[13px] leading-[1.6] text-[color:var(--color-text-mute)]">
            The playground holds no LiveKit account on your behalf. The visitor brings their own
            LiveKit URL, API key, and secret; the token is minted in the browser. Provider keys
            (OpenAI, Deepgram, etc.) stay in the agent&apos;s{' '}
            <code className="font-mono text-[color:var(--color-text-dim)]">.env</code>. The cookbook
            stays open source:{' '}
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
    </Grain>
  );
}

function ShippedCard({ demo }: { demo: ShippedDemo }) {
  return (
    <div className="relative flex h-full flex-col rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-[18px] transition-colors hover:border-[color:var(--color-accent)]">
      {/* Stretched link makes the whole card a click target without nesting the source anchor inside it. */}
      <Link
        href={`/demos/${demo.slug}`}
        aria-label={`Open ${demo.title}`}
        className="absolute inset-0 z-0 rounded-[var(--radius-panel)]"
      />
      <Eyebrow className="text-[10px]">{demo.category}</Eyebrow>
      <h3 className="mt-[13px] text-[19px] leading-tight font-semibold tracking-[-0.01em] text-[color:var(--color-text)]">
        {demo.title}
      </h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-[1.55] text-[color:var(--color-text-mute)]">
        {demo.description}
      </p>
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-[13px] font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)]">
        <CookbookSourceLink slug={demo.slug} variant="inline" />
        <span className="text-[color:var(--color-accent)]">▶ play</span>
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
      className="flex h-full flex-col rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border-dim)] bg-[color:var(--color-surface)] p-[18px] opacity-70 transition-opacity hover:opacity-100"
    >
      <div className="flex items-center justify-between">
        <Eyebrow className="text-[10px]">{demo.category} · planned</Eyebrow>
        <span className="font-mono text-[10px] text-[color:var(--color-text-mute)]">
          {demo.target_date}
        </span>
      </div>
      <h3 className="mt-[13px] text-[19px] leading-tight font-semibold tracking-[-0.01em] text-[color:var(--color-text-dim)]">
        {demo.title}
      </h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-[1.55] text-[color:var(--color-text-mute)]">
        {demo.why}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border-dim)] pt-[13px] font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)]">
        <span>source ↗</span>
        <span className="text-[color:var(--color-text-mute)]">target {demo.target_date}</span>
      </div>
    </a>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-[color:var(--color-border-dim)] p-[18px]">
      <Eyebrow accent className="text-[11px]">
        {number}
      </Eyebrow>
      <h3 className="mt-[10px] text-[16px] font-semibold tracking-tight text-[color:var(--color-text)]">
        {title}
      </h3>
      <p className="mt-[6px] text-[13px] leading-[1.5] text-[color:var(--color-text-mute)]">
        {body}
      </p>
    </div>
  );
}
