import type { Metadata } from 'next';
import { Eyebrow, Grain } from '@/components/phosphor';

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';

export const metadata: Metadata = {
  title: 'About · voice playground',
  description:
    'A browser surface for talking to voice agents from the awesome-voice-apps cookbook. Bring your own provider keys, run the agent locally, talk to it in your browser.',
};

const TECH_CHIPS = ['NEXT 15', 'REACT 19', 'LIVEKIT', 'TAILWIND v4', 'TS', 'ZOD'];

const WHAT_THIS_ISNT: [string, string][] = [
  ['Not a hosted voice service.', 'You bring your own LiveKit and provider accounts.'],
  ['Not a UI editor.', 'Agent code lives in your editor, not here.'],
  ['Not a transcript archive.', 'Sessions are ephemeral; close the tab and they are gone.'],
];

export default function AboutPage() {
  return (
    <Grain>
      <main className="mx-auto w-full max-w-[1000px] px-6 pt-14 pb-16">
        <Eyebrow>{'// field manual'}</Eyebrow>

        <div className="mt-7 grid gap-[44px] md:grid-cols-[6fr_4fr]">
          <section>
            <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
              What this is.
            </h1>

            <p className="mt-5 text-[15.5px] leading-[1.62] text-[color:var(--color-text-dim)]">
              Voice playground is a browser surface for talking to voice agents from the
              awesome-voice-apps cookbook.
            </p>

            <p className="mt-4 text-[15.5px] leading-[1.62] text-[color:var(--color-text-dim)]">
              Clone the cookbook, run a demo agent locally with{' '}
              <code className="font-mono text-[13px] text-[color:var(--color-accent)]">
                uv run python agent.py dev
              </code>
              , paste your provider keys on the demo page, and talk to it. The agent runs on your
              machine; the playground runs in your browser.
            </p>

            <p className="mt-4 text-[15.5px] leading-[1.62] text-[color:var(--color-text-dim)]">
              Nothing leaves the browser. No server-side credentials, no transcript persistence, no
              telemetry on session content. The LiveKit access token mints client-side from your own
              API key and secret.
            </p>

            <p className="mt-4 text-[15.5px] leading-[1.62] text-[color:var(--color-text-dim)]">
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
            <Eyebrow muted>{"// what this isn't"}</Eyebrow>
            <ul className="mt-[18px] flex list-none flex-col gap-[14px] p-0">
              {WHAT_THIS_ISNT.map(([head, body]) => (
                <li
                  key={head}
                  className="relative pl-4 text-[13.5px] leading-[1.5] text-[color:var(--color-text-mute)]"
                >
                  <span className="absolute top-[7px] left-0 h-[6px] w-[6px] rounded-full bg-[color:var(--color-accent)]" />
                  <span className="text-[color:var(--color-text-dim)]">{head}</span> {body}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="mt-[52px] flex flex-wrap items-center gap-2 border-t border-[color:var(--color-border-dim)] pt-[22px]">
          {TECH_CHIPS.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-full border border-[color:var(--color-border)] px-3 py-[6px] font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-mute)]"
            >
              {chip}
            </span>
          ))}
        </div>
      </main>
    </Grain>
  );
}
