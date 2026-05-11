import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { getAllDemos } from '@/lib/demos';

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
          <p className="tiny-mono">{'// playground v1 · index'}</p>
          <h1 className="h-hand xxl mt-3 leading-[0.95]">
            Voice AI agents
            <br />
            that don&apos;t stop
            <br />
            <span style={accentColor}>at hello.</span>
          </h1>
          <p className="p-hand mt-5 max-w-md">
            Talk to live demos in your browser. Bring your own keys, your own stack, your own data.
            We don&apos;t lock you in.
          </p>
          <div className="line wavy mt-6 max-w-xs"></div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/demos" className="btn accent brand-accent">
              Browse the demos →
            </Link>
            <span className="tiny-mono">no signup · no card</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="recent-demos" className="mt-24">
        <div className="flex items-end justify-between gap-3">
          <h2 id="recent-demos" className="h-hand xl">
            Recent demos
          </h2>
          <span className="tiny-mono">
            recent · top {Math.max(demos.length, 1)} of {demos.length || '0'}
          </span>
        </div>
        <div className="line mt-3 mb-6"></div>

        {demos.length === 0 ? (
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
              repo and appear here as soon as one ships a{' '}
              <span className="kbd">playground.json</span>.
            </p>
          </div>
        ) : (
          <ul role="list" className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {demos.map((demo, i) => {
              const tilt = i === 0 ? '-0.4deg' : i === 2 ? '0.5deg' : undefined;
              return (
                <li key={demo.slug} style={tilt ? { transform: `rotate(${tilt})` } : undefined}>
                  <Link
                    href={`/demos/${demo.slug}`}
                    className="ab block transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ outlineColor: 'var(--accent-hex)' }}
                  >
                    <div className="ab-head">
                      <span className="label">/demos/{demo.slug}</span>
                      <span className="meta">
                        {String(i + 1).padStart(2, '0')} · {String(demos.length).padStart(2, '0')}
                      </span>
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

      <section aria-label="About link" className="mt-24">
        <div className="line soft"></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="p-hand sm max-w-md">
            More about how we work, what ships in 90 days, and why we don&apos;t take retainers.
          </p>
          <Link href="/about" className="btn">
            Read the about →
          </Link>
        </div>
      </section>
    </main>
  );
}
