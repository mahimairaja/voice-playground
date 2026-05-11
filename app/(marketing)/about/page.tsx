import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About · voice playground',
  description:
    'A standalone UI to try voice agents from the awesome-voice-apps catalogue. Bring your own provider keys, talk to a demo in your browser, see the agent mount UI in real time.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28">
      <header className="relative">
        <p className="tiny-mono">· field manual · v1</p>
        <h1
          className="mt-2 leading-[0.92]"
          style={{
            fontFamily: 'var(--hand-title)',
            fontWeight: 700,
            fontSize: 'clamp(40px, 6vw, 64px)',
          }}
        >
          what this is.
          <br />
          <span style={{ color: 'var(--accent-hex)' }}>what it isn&apos;t.</span>
        </h1>
        <p className="p-hand mt-4 max-w-xl text-[14px]">
          an open-source UI for the{' '}
          <a
            href="https://github.com/mahimailabs/awesome-voice-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            awesome-voice-apps
          </a>{' '}
          catalogue. pick a demo, paste your provider keys, talk to it in your browser. the agent
          can mount UI on the canvas while you speak.
        </p>
      </header>

      <section aria-labelledby="positioning" className="mt-10">
        <h2 id="positioning" className="sr-only">
          Positioning
        </h2>
        <div className="line wavy"></div>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="box" style={{ padding: 18 }}>
            <p className="tiny-mono">· IS</p>
            <h3 className="h-hand xl" style={{ marginTop: 6 }}>
              A try-before-you-clone playground.
            </h3>
            <ul className="p-hand mt-3 space-y-2">
              <li>· A live UI for the agents catalogued in awesome-voice-apps.</li>
              <li>· Bring-your-own keys. The token mints in your browser, never on a server.</li>
              <li>· A working stack: STT, LLM, TTS, RTC, wired and shipped.</li>
              <li>· Open by default. MIT-licensed. Fork it, host it, run it locally.</li>
            </ul>
          </div>
          <div className="box dashed" style={{ padding: 18 }}>
            <p className="tiny-mono">· ISN&apos;T</p>
            <h3 className="h-hand xl" style={{ marginTop: 6 }}>
              Not a hosted product.
            </h3>
            <ul className="p-hand mt-3 space-y-2">
              <li>· Not a SaaS. No accounts, no seats, no quotas.</li>
              <li>· Not a managed service. Your keys, your providers, your cloud.</li>
              <li>· Not a chatbot. These agents listen and speak in real time.</li>
              <li>· Not stored. Nothing said in a demo lives on a server you do not control.</li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="stack" className="mt-10">
        <p id="stack" className="tiny-mono">
          · the stack
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="chip accent brand-accent">Next 15</span>
          <span className="chip">LiveKit</span>
          <span className="chip">Deepgram</span>
          <span className="chip">OpenAI</span>
          <span className="chip">Cartesia</span>
          <span className="chip">zod</span>
          <span className="chip">zustand</span>
        </div>
        <p className="p-hand sm mt-3" style={{ color: 'var(--ink-soft)' }}>
          The voice runtime sits on top of LiveKit. Provider choice is whatever the agent worker in{' '}
          <span className="kbd">awesome-voice-apps</span> wires up. Add a new provider by editing
          the agent and re-listing the credential in the demo manifest.
        </p>
      </section>

      <section aria-labelledby="how" className="mt-10">
        <p id="how" className="tiny-mono">
          · how it works
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="box" style={{ padding: 14 }}>
            <p className="tiny-mono">01</p>
            <p
              className="mt-1"
              style={{ fontFamily: 'var(--hand-title)', fontWeight: 700, fontSize: 18 }}
            >
              pick a demo
            </p>
            <p className="p-hand sm mt-2">
              Browse the corkboard. Each card is a real agent from the awesome-voice-apps repo.
            </p>
          </div>
          <div className="box" style={{ padding: 14 }}>
            <p className="tiny-mono">02</p>
            <p
              className="mt-1"
              style={{ fontFamily: 'var(--hand-title)', fontWeight: 700, fontSize: 18 }}
            >
              paste your keys
            </p>
            <p className="p-hand sm mt-2">
              Open the vault. Keys live only in your browser. Closing the tab keeps them; clearing
              site data wipes them.
            </p>
          </div>
          <div className="box" style={{ padding: 14 }}>
            <p className="tiny-mono">03</p>
            <p
              className="mt-1"
              style={{ fontFamily: 'var(--hand-title)', fontWeight: 700, fontSize: 18 }}
            >
              talk to it
            </p>
            <p className="p-hand sm mt-2">
              Press start. The token mints in-browser; LiveKit handles the audio. The agent can
              mount UI cards on the canvas as you talk.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="source" className="mt-12">
        <p id="source" className="tiny-mono">
          · source
        </p>
        <div className="box hatch mt-3" style={{ padding: 14 }}>
          <p className="p-hand sm">
            This playground:{' '}
            <a
              href="https://github.com/mahimairaja/voice-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              github.com/mahimairaja/voice-playground
            </a>
          </p>
          <p className="p-hand sm mt-1">
            Agents catalogue:{' '}
            <a
              href="https://github.com/mahimailabs/awesome-voice-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              github.com/mahimailabs/awesome-voice-apps
            </a>
          </p>
          <div className="line soft" style={{ margin: '10px 0 6px' }}></div>
          <p className="tiny-mono">MIT · BYO keys · no telemetry</p>
        </div>
      </section>

      <section aria-label="Footer link" className="mt-12">
        <div className="line soft"></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="tiny-mono underline underline-offset-4">
            ← back to home
          </Link>
          <Link href="/demos" className="btn">
            Browse the demos →
          </Link>
        </div>
      </section>
    </main>
  );
}
