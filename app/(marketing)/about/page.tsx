import type { Metadata } from 'next';

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
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 700,
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
          · THE STACK
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

      <section aria-labelledby="shipped" className="mt-10">
        <div className="box hatch" style={{ padding: 14 }}>
          <p id="shipped" className="tiny-mono">
            · shipped from
          </p>
          <p className="h-hand xl mt-1">toronto · ✦</p>
          <p className="tiny-mono mt-2">MIT · BYO keys</p>
        </div>
      </section>

      <section aria-label="Manual footer" className="mt-12">
        <div className="line soft"></div>
        <p className="tiny-mono mt-4">· MANUAL Next LK DG 4o</p>
      </section>
    </main>
  );
}
