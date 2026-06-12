import type { Metadata } from 'next';

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';

export const metadata: Metadata = {
  title: 'Maintenance · voice playground',
  description: 'Voice playground is offline for a quick swap.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="mx-auto flex max-w-[520px] flex-col gap-4 px-6 py-24">
      <span className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--color-warning)] uppercase">
        MAINTENANCE · 503
      </span>
      <h1 className="text-[28px] font-semibold tracking-tight text-[color:var(--color-text)]">
        Back in a minute.
      </h1>
      <p className="text-[14px] text-[color:var(--color-text-dim)]">
        Playground is offline for a quick swap. No action needed on your end.
      </p>
      <p className="text-[14px] text-[color:var(--color-text-dim)]">
        The cookbook is open source and stays up while this site is down.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <a
          href={COOKBOOK_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-[var(--radius-button)] bg-[color:var(--color-accent)] px-4 py-2 text-[13.5px] font-semibold text-[color:var(--color-text)] hover:brightness-105"
        >
          → View the cookbook
        </a>
        <a
          href="mailto:hello@mahimai.ca"
          className="rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-4 py-2 text-[13px] text-[color:var(--color-text)] hover:border-[color:var(--color-border-strong)]"
        >
          hello@mahimai.ca
        </a>
      </div>
    </main>
  );
}
