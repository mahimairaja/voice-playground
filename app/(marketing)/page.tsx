import Link from 'next/link';
import { getAllDemos } from '@/lib/demos';

const PIN_COLORS = ['var(--accent-hex)', 'var(--ink)', '#d4a657'];

const FALLBACK_RECEIPTS: { title: string; tagline: string }[] = [
  { title: 'real estate concierge', tagline: 'tour a listing by voice' },
  { title: 'restaurant reservations', tagline: 'book a table, end-to-end' },
  { title: 'plumber dispatch', tagline: 'route an emergency call' },
];

export default function HomePage() {
  const realDemos = getAllDemos().slice(0, 3);
  const usingFallback = realDemos.length === 0;
  const receipts = usingFallback
    ? FALLBACK_RECEIPTS.map((r) => ({ ...r, slug: null as string | null }))
    : realDemos.map((d) => ({ title: d.title, tagline: d.description, slug: d.slug }));

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
              fontWeight: 700,
              fontSize: 'clamp(48px, 7vw, 84px)',
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
            paste your provider keys, pick a demo, hear the stack work. open source. nothing stored.
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
              fontFamily: 'var(--hand-title)',
              color: 'var(--accent-hex)',
              fontStyle: 'italic',
              fontSize: 16,
            }}
          >
            ↑ dials out in &lt;600ms
          </p>
        </div>

        <aside aria-labelledby="try-one">
          <p id="try-one" className="tiny-mono">
            · try one now
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {receipts.map((demo, i) => {
              const tilt = [-0.6, 0.4, -0.3][i] ?? 0;
              const pin = PIN_COLORS[i % PIN_COLORS.length];
              const Wrapper = ({ children }: { children: React.ReactNode }) =>
                demo.slug ? (
                  <Link
                    href={`/demos/${demo.slug}`}
                    className="block focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ outlineColor: 'var(--accent-hex)' }}
                  >
                    {children}
                  </Link>
                ) : (
                  <div>{children}</div>
                );

              return (
                <div
                  key={demo.title}
                  className="relative"
                  style={{ transform: `rotate(${tilt}deg)` }}
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
                  <Wrapper>
                    <div className="box transition-transform duration-200 ease-out hover:-translate-y-0.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          style={{
                            fontFamily: 'var(--hand-title)',
                            fontWeight: 700,
                            fontSize: 18,
                          }}
                        >
                          {demo.title}
                        </span>
                        <span className="tiny-mono">▶ play</span>
                      </div>
                      <p
                        className="p-hand"
                        style={{ marginTop: 2, fontSize: 12.5, color: 'var(--ink-2)' }}
                      >
                        {demo.tagline}
                      </p>
                    </div>
                  </Wrapper>
                </div>
              );
            })}
          </div>
          {usingFallback && (
            <p className="tiny-mono mt-3" style={{ opacity: 0.7 }}>
              · sample · waiting on real manifests
            </p>
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
