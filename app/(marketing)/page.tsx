import Link from 'next/link';
import { getLandingPreviewCards } from '@/lib/demos';

/**
 * F1.1 minimal restyle. The hero + featured-demos rebuild is deferred to F1.2
 * (REQ-AVA-LAND-001). This pass only ensures the landing route does not break
 * visually under the new dark + Geist + cyan token system. F1.2 will replace
 * the layout structure with the spec'd above-the-fold hero + how-it-works.
 */
export default function HomePage() {
  const previewCards = getLandingPreviewCards();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section aria-label="Hero" className="grid gap-12 md:grid-cols-[3fr_2fr]">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
            · LANDING · F1.1
          </p>
          <h1 className="mt-3 text-[42px] leading-[1.05] font-semibold tracking-tight text-[color:var(--color-text)]">
            Talk to a voice agent. <br />
            <span className="text-[color:var(--color-accent)]">Not a brochure.</span>
          </h1>
          <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.6] text-[color:var(--color-text-dim)]">
            A browser surface for voice agents from the awesome-voice-apps cookbook. Bring your own
            provider keys, run the agent locally, talk to it here. Nothing leaves the browser.
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

        <aside>
          <p className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
            {'// FEATURED · CLICK TO TRY'}
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {previewCards.length === 0 ? (
              <p className="rounded-[var(--radius-panel)] border border-dashed border-[color:var(--color-border)] p-4 text-[13px] text-[color:var(--color-text-mute)]">
                No shipped demos yet. The catalog populates as the sibling awesome-voice-apps repo
                ships demos.
              </p>
            ) : (
              previewCards.map((card) => {
                const inner = (
                  <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-border-strong)]">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-semibold text-[color:var(--color-text)]">
                        {card.title}
                      </span>
                      {card.cta ? (
                        <span className="font-mono text-[10.5px] tracking-[0.06em] text-[color:var(--color-accent)] uppercase">
                          {card.cta}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[13px] text-[color:var(--color-text-mute)]">
                      {card.body}
                    </p>
                  </div>
                );
                return card.slug ? (
                  <Link key={card.slug} href={`/demos/${card.slug}`}>
                    {inner}
                  </Link>
                ) : (
                  <div key={card.title}>{inner}</div>
                );
              })
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
