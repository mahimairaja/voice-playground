import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { getAllDemos } from '@/lib/demos';

const PIN_COLORS = ['var(--accent-hex)', 'var(--ink)', '#d4a657'];

export default function HomePage() {
  const demos = getAllDemos().slice(0, 3);
  const accentColor: React.CSSProperties = { color: 'var(--accent-hex)' };

  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28">
      <section
        aria-label="Introduction"
        className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10"
      >
        <div className="ab brand-accent relative">
          <div className="ab-head">
            <span className="label">mascot</span>
            <span className="meta">528 · 528</span>
          </div>
          <div className="ab-body flex items-center justify-center py-6">
            <Logo size={200} />
          </div>
          <span className="stamp">EST · 2026</span>
        </div>

        <div>
          <p className="tiny-mono">{'// lab notebook · entry 04'}</p>
          <h1 className="h-hand xxl mt-3 leading-[0.95]">
            Voice AI agents
            <br />
            that don&apos;t stop
            <br />
            <span style={accentColor}>at hello.</span>
          </h1>
          <p className="p-hand mt-5 max-w-md">
            Paste your provider keys, pick a demo, hear the stack work in your browser. Open source.
            Nothing stored.
          </p>
          <div className="line wavy mt-6 max-w-xs"></div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/demos" className="btn accent brand-accent">
              Open the demos →
            </Link>
            <Link href="/about" className="btn">
              How it works
            </Link>
          </div>
          <p
            className="mt-3 italic"
            style={{
              fontFamily: 'var(--hand-title)',
              color: 'var(--accent-hex)',
              fontSize: 16,
            }}
          >
            ↑ talks back in &lt;600ms
          </p>
        </div>
      </section>

      <section aria-labelledby="try-one" className="mt-24">
        <div className="flex items-end justify-between gap-3">
          <h2 id="try-one" className="h-hand xl">
            Try one now
          </h2>
          <span className="tiny-mono">
            · pinned · {Math.max(demos.length, 0)} of {demos.length || '0'}
          </span>
        </div>
        <div className="line mt-3 mb-8"></div>

        {demos.length === 0 ? (
          <div
            aria-label="No demos pinned yet"
            className="box hatch"
            style={{ padding: 22, position: 'relative' }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -7,
                left: 24,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'var(--accent-hex)',
                border: '1.5px solid var(--ink)',
              }}
            />
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
        ) : (
          <ul role="list" className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {demos.map((demo, i) => {
              const tilts = [-1.2, 0.4, 1.0];
              const tilt = tilts[i] ?? 0;
              const pin = PIN_COLORS[i % PIN_COLORS.length];
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
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-8 flex items-center justify-end gap-2">
          <Link href="/demos" className="btn">
            See all demos →
          </Link>
        </div>
      </section>

      <section aria-label="Closing strip" className="mt-24">
        <div className="line"></div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="tiny-mono">· no keys logged · BYO providers · MIT</p>
          <Link href="/about" className="tiny-mono underline underline-offset-4">
            · what this is, what it isn&apos;t →
          </Link>
        </div>
      </section>
    </main>
  );
}
