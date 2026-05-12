import Link from 'next/link';
import { getLandingPreviewCards } from '@/lib/demos';

const PIN_COLORS = ['var(--accent-hex)', 'var(--ink)', '#d4a657'];

export default function HomePage() {
  const previewCards = getLandingPreviewCards();

  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-12 md:pt-28">
      <section
        aria-label="Hero"
        className="relative grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-12"
      >
        <div>
          <p className="tiny-mono">· lab notebook · entry 04</p>
          <h1
            className="mt-3 leading-[0.92]"
            style={{
              fontFamily: 'var(--hand-title)',
              fontSize: 'clamp(48px, 7vw, 84px)',
              fontWeight: 700,
            }}
          >
            talk to an agent.
            <br />
            not a brochure.
          </h1>
          <svg
            aria-hidden="true"
            width="240"
            height="8"
            viewBox="0 0 240 8"
            className="mt-3"
            style={{ display: 'block' }}
          >
            <path
              d="M 2 5 Q 60 0 120 4 T 238 3"
              stroke="var(--accent-hex)"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <p className="p-hand mt-5 max-w-md text-[15px]">
            paste your provider keys, pick a demo, hear the stack work. open source · nothing
            stored.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/demos" className="btn accent brand-accent">
              open the demos →
            </Link>
            <Link href="/about" className="btn">
              how it works
            </Link>
          </div>
          <p
            className="mt-3"
            style={{
              color: 'var(--accent-hex)',
              fontFamily: 'var(--hand-title)',
              fontSize: 16,
              fontStyle: 'italic',
            }}
          >
            ↑ dials out in &lt;600ms
          </p>
        </div>

        <aside aria-labelledby="try-one">
          <p id="try-one" className="tiny-mono">
            · try one now · hover to preview
          </p>
          {previewCards.length === 0 ? (
            <div className="box dashed mt-3">
              <p className="p-hand sm">
                The corkboard is empty until the sibling awesome-voice-apps repo ships a playground
                manifest.
              </p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {previewCards.map((card, i) => {
                const tilt = [-0.6, 0.4, -0.3][i] ?? 0;
                const pin = PIN_COLORS[i % PIN_COLORS.length];
                const inner = (
                  <div className="box transition-transform duration-200 ease-out hover:-translate-y-0.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span
                        style={{
                          fontFamily: 'var(--hand-title)',
                          fontSize: 18,
                          fontWeight: 700,
                        }}
                      >
                        {card.title}
                      </span>
                      {card.cta && <span className="tiny-mono">{card.cta}</span>}
                    </div>
                    <p
                      className="p-hand"
                      style={{ color: 'var(--ink-2)', fontSize: 12.5, marginTop: 2 }}
                    >
                      {card.body}
                    </p>
                  </div>
                );
                return (
                  <div
                    key={card.slug ?? card.title}
                    className="relative"
                    style={{ transform: `rotate(${tilt}deg)` }}
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
                      <Link
                        href={`/demos/${card.slug}`}
                        className="block focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ outlineColor: 'var(--accent-hex)' }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div aria-disabled="true">{inner}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </section>

      <section aria-label="Closing rule" className="mt-20">
        <div className="line wavy"></div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="tiny-mono">· no keys logged · BYO providers · MIT</p>
          <Link href="/about" className="tiny-mono underline underline-offset-4">
            · scroll to flip the page ↓
          </Link>
        </div>
      </section>
    </main>
  );
}
