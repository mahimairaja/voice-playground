import type { Metadata } from 'next';
import { ComponentGallery } from '@/components/contribute/ComponentGallery';
import { Eyebrow } from '@/components/phosphor';
import { CopySnippet } from '@/components/playground/CopySnippet';

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';
const COOKBOOK_CONTRIBUTING = `${COOKBOOK_URL}/blob/main/CONTRIBUTING.md`;
const EXAMPLE_BLOG = `${COOKBOOK_URL}/blob/main/demos/front-desk-interpreter/blog.md`;

export const metadata: Metadata = {
  title: 'Contribute · voice playground',
  description:
    'Ship a voice-agent demo to the cookbook: branch, write the agent, reuse the playground components, write a short build writeup.',
};

const BLOG_SKELETON = `---
title: <one line on what you built>
summary: <one or two sentences; becomes the page description>
author: <your name>
---

## The problem
What real task this agent does.

## Why this stack
The STT, LLM, and TTS you picked, one reason each.

## The interesting part
The 20-40 lines that make it work.

## What surprised me
One thing you learned building it.

## Run it
https://playground.mahimai.ca/demos/<slug>`;

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[color:var(--color-border-dim)] pt-7">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[13px] font-semibold text-[color:var(--color-accent-dim)]">
          {n}
        </span>
        <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[color:var(--color-text)]">
          {title}
        </h2>
      </div>
      <div className="mt-3 max-w-[68ch] text-[15px] leading-[1.6] text-[color:var(--color-text-dim)]">
        {children}
      </div>
    </section>
  );
}

export default function ContributePage() {
  return (
    <main className="mx-auto w-full max-w-[860px] px-6 pt-14 pb-20">
      <Eyebrow>contribute</Eyebrow>
      <h1 className="mt-2.5 text-[34px] leading-none font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
        Ship a demo
      </h1>
      <p className="mt-3 max-w-[64ch] text-[16px] leading-[1.6] text-[color:var(--color-text-dim)]">
        A demo is a small voice agent in the{' '}
        <a
          href={COOKBOOK_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[color:var(--color-accent-dim)] hover:underline"
        >
          awesome-voice-apps
        </a>{' '}
        cookbook. The agent runs on the contributor&apos;s machine; this playground is the browser
        client that talks to it and renders its UI. Here is the whole path.
      </p>

      <div className="mt-9 flex flex-col gap-7">
        <Step n="01" title="Scope your demo">
          Pick one concrete task an agent can do by voice (book a slot, take an order, quiz the
          caller). Decide which of the components below it will draw, so you build against what
          already exists.
        </Step>

        <Step n="02" title="Fork and branch">
          Fork the cookbook and branch off{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">main</code>:
          <div className="mt-2.5">
            <CopySnippet command="git switch -c feat/demo-<slug>" />
          </div>
        </Step>

        <Step n="03" title="Write the agent">
          Copy{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            templates/livekit-base/
          </code>{' '}
          into{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            demos/&lt;slug&gt;/
          </code>
          , edit{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            agent.py
          </code>{' '}
          and{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            pyproject.toml
          </code>
          , and run it locally:
          <div className="mt-2.5">
            <CopySnippet command="uv run python agent.py dev" />
          </div>
          To draw UI, publish{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            ui_event
          </code>{' '}
          envelopes on the{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">ui</code>{' '}
          data channel and list the component names in your{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            playground.json
          </code>
          .
        </Step>

        <Step n="04" title="Reuse a component">
          These render in the agent canvas already. Use a name below and send its props in a{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            ui_event
          </code>
          ; expand a tile to copy the exact envelope. They are available to every demo, no
          playground change needed.
          <div className="mt-5">
            <ComponentGallery />
          </div>
        </Step>

        <Step n="05" title="Write the blog (required)">
          Every demo ships a short build writeup at{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            demos/&lt;slug&gt;/blog.md
          </code>{' '}
          and sets{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            &quot;blog&quot;: true
          </code>{' '}
          in{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            playground.json
          </code>
          . Plain markdown only (no raw HTML, no em dashes). To add an image or diagram, host it at
          a public internet URL and link it inline, like{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            ![alt](https://your-host/diagram.svg)
          </code>
          . Image files are not committed to the repo, and inline{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            &lt;svg&gt;
          </code>{' '}
          or HTML is stripped, so the URL must be publicly fetchable. Start from this:
          <pre className="mt-3 overflow-x-auto rounded-[8px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3.5 font-mono text-[12px] leading-[1.55] text-[color:var(--color-text-dim)]">
            {BLOG_SKELETON}
          </pre>
          <p className="mt-2.5 text-[14px] text-[color:var(--color-text-mute)]">
            See a finished one:{' '}
            <a
              href={EXAMPLE_BLOG}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[color:var(--color-accent-dim)] hover:underline"
            >
              front-desk-interpreter/blog.md ↗
            </a>
          </p>
        </Step>

        <Step n="06" title="Open the PR">
          Commit{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            feat(demo): &lt;slug&gt;
          </code>{' '}
          and open a PR. The cookbook&apos;s pre-commit hook regenerates{' '}
          <code className="font-mono text-[13px] text-[color:var(--color-accent-dim)]">
            catalog.json
          </code>{' '}
          (never edit it by hand). Once merged, your demo appears on the playground within about
          five minutes. Full rules:{' '}
          <a
            href={COOKBOOK_CONTRIBUTING}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[color:var(--color-accent-dim)] hover:underline"
          >
            cookbook CONTRIBUTING ↗
          </a>
          .
        </Step>
      </div>
    </main>
  );
}
