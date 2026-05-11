import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About · Mahimai AI playground',
  description:
    'Mahimai AI is a Canada-based voice agent consultancy. We build voice systems that sound like your best employee and hand the code over on day one.',
};

interface Principle {
  n: string;
  title: string;
  body: string;
}

const PRINCIPLES: Principle[] = [
  {
    n: '01',
    title: 'Your code.',
    body: 'Source delivered day one of production. No black boxes, no escrow.',
  },
  {
    n: '02',
    title: 'Your cloud.',
    body: 'Runs on the infra you already pay for. Self-host the agent and the gateway.',
  },
  {
    n: '03',
    title: 'Your keys.',
    body: 'We never sit between you and a provider. Bring your OpenAI, Deepgram, Cartesia.',
  },
  {
    n: '04',
    title: 'No platform fee.',
    body: "We're paid to build, milestone by milestone. Not to rent you a number.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28">
      <header>
        <p className="tiny-mono">{'// playground v1 · about'}</p>
        <h1 className="h-hand xxl mt-3 leading-[0.95]">About Mahimai AI</h1>
        <p className="p-hand mt-4 max-w-xl">
          A small Canadian shop that ships voice agents end-to-end. This playground is where you can
          talk to them in your browser before you hire us.
        </p>
      </header>

      <section aria-label="Letter from the founder" className="mt-14">
        <div className="line"></div>
        <div className="box mt-6" style={{ padding: 22 }}>
          <p className="tiny-mono">A letter to whoever&apos;s hiring us</p>
          <h2 className="h-hand xl" style={{ marginTop: 6 }}>
            Hi.
          </h2>
          <p className="p-hand mt-4">
            We build voice systems that sound like your best employee, and we hand the code over on
            day one. That&apos;s the whole company.
          </p>
          <p className="p-hand mt-3">
            We&apos;ve watched too many small businesses rent a voice from a vendor who could raise
            prices, change the contract, or disappear. We don&apos;t want to be that vendor.
          </p>
          <p className="p-hand mt-3">
            <b>Never locked in</b> is the promise. Your code, your cloud, your keys, always.
          </p>
          <div className="line soft" style={{ margin: '14px 0 8px' }}></div>
          <p className="p-hand sm">Mahimai, founder · Sarnia, Ontario</p>
        </div>
      </section>

      <section aria-labelledby="principles" className="mt-20">
        <div className="flex items-end justify-between gap-3">
          <h2 id="principles" className="h-hand xl">
            How we work · four principles
          </h2>
          <span className="tiny-mono">/principles</span>
        </div>
        <div className="line mt-3 mb-6"></div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="box" style={{ padding: 16 }}>
              <p className="tiny-mono">{p.n}</p>
              <b className="h-hand xl" style={{ display: 'block', marginTop: 4 }}>
                {p.title}
              </b>
              <p className="p-hand sm" style={{ marginTop: 8 }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>

        <div className="box hatch mt-6" style={{ padding: 14 }}>
          <p className="tiny-mono">Built in Canada · live worldwide</p>
          <p className="p-hand sm" style={{ marginTop: 4 }}>
            Founder-led engineering. Plain-English scoping. Milestone billing, no retainers.
          </p>
        </div>
      </section>

      <section aria-labelledby="cookbook" className="mt-20">
        <div className="flex items-end justify-between gap-3">
          <h2 id="cookbook" className="h-hand xl">
            About this playground
          </h2>
          <span className="tiny-mono">/cookbook</span>
        </div>
        <div className="line mt-3 mb-6"></div>

        <div className="box dashed" style={{ padding: 18 }}>
          <p className="p-hand">
            This site is the <b>Mahimai cookbook</b>. Every demo here is a real, runnable voice
            agent that lives in our open-source{' '}
            <a
              href="https://github.com/mahimailabs/awesome-voice-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              awesome-voice-apps
            </a>{' '}
            repo. Pick one, paste your provider keys, and talk to it. The same code ships into
            production for clients on day one.
          </p>
          <div className="line wavy" style={{ margin: '12px 0' }}></div>
          <p className="p-hand sm">
            Nothing you say in a demo is recorded server-side. Keys live only in your browser&apos;s
            localStorage. Close the tab and they go with you.
          </p>
        </div>
      </section>

      <section aria-label="Contact" className="mt-20">
        <div className="line soft"></div>
        <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="tiny-mono">/contact</p>
            <p className="h-hand xl" style={{ marginTop: 6 }}>
              Want a voice agent of your own?
            </p>
            <p className="p-hand mt-2 max-w-md">
              Plain-text email is the fastest way to reach the founder.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="mailto:hello@mahimai.ca" className="btn accent brand-accent">
              hello@mahimai.ca
            </a>
            <Link href="/demos" className="btn">
              Try a demo →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
