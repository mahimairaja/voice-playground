import type { Metadata } from 'next';

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';

export const metadata: Metadata = {
  title: 'About · voice playground',
  description:
    'A browser surface for talking to voice agents from the awesome-voice-apps cookbook. Bring your own provider keys, run the agent locally, talk to it in your browser.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-[6fr_4fr]">
        <section>
          <h2 className="text-[24px] font-semibold tracking-tight text-[color:var(--color-text)]">
            What this is.
          </h2>

          <p className="mt-5 text-[15px] leading-[1.6] text-[color:var(--color-text-dim)]">
            Voice playground is a browser surface for talking to voice agents from the
            awesome-voice-apps cookbook.
          </p>

          <p className="mt-4 text-[15px] leading-[1.6] text-[color:var(--color-text-dim)]">
            Clone the cookbook, run a demo agent locally with{' '}
            <code className="font-mono text-[13px] text-[color:var(--color-accent)]">
              uv run python agent.py dev
            </code>
            , paste your provider keys on the demo page, and talk to it. The agent runs on your
            machine; the playground runs in your browser.
          </p>

          <p className="mt-4 text-[15px] leading-[1.6] text-[color:var(--color-text-dim)]">
            Nothing leaves the browser. No server-side credentials, no transcript persistence, no
            telemetry on session content. The LiveKit access token mints client-side from your own
            API key and secret.
          </p>

          <p className="mt-4 text-[15px] leading-[1.6] text-[color:var(--color-text-dim)]">
            All demos live in{' '}
            <a
              href={COOKBOOK_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[color:var(--color-accent)] underline-offset-4 hover:underline"
            >
              awesome-voice-apps ↗
            </a>
            .
          </p>
        </section>

        <aside>
          <h3 className="font-mono text-[12.5px] tracking-[0.06em] text-[color:var(--color-text-mute)] uppercase">
            {"// What this isn't"}
          </h3>
          <ul className="mt-4 flex flex-col gap-3 text-[13px] text-[color:var(--color-text-mute)]">
            <li>
              <span className="text-[color:var(--color-text-dim)]">
                Not a hosted voice service.
              </span>{' '}
              You bring your own LiveKit and provider accounts.
            </li>
            <li>
              <span className="text-[color:var(--color-text-dim)]">Not a UI editor.</span> Agent
              code lives in your editor, not here.
            </li>
            <li>
              <span className="text-[color:var(--color-text-dim)]">Not a transcript archive.</span>{' '}
              Sessions are ephemeral; close the tab and they are gone.
            </li>
          </ul>
        </aside>
      </div>

      <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-[color:var(--color-border-dim)] pt-6">
        {['NEXT 15', 'REACT 19', 'LIVEKIT', 'TAILWIND v4', 'TS', 'ZOD'].map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center rounded-[var(--radius-pill)] border border-[color:var(--color-border)] px-3 py-1 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-mute)] uppercase"
          >
            {chip}
          </span>
        ))}
      </div>
    </main>
  );
}
