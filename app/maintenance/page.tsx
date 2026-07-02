import type { Metadata } from 'next';
import { Btn } from '@/components/phosphor';

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';

export const metadata: Metadata = {
  title: 'Maintenance · voice playground',
  description: 'Voice playground is offline for a quick swap.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="mx-auto flex max-w-[520px] flex-col gap-4 px-6 py-24">
      <span className="text-xs font-bold tracking-widest text-[color:var(--color-warning)] uppercase">
        Maintenance · 503
      </span>
      <h1 className="text-[28px] font-bold tracking-tight text-[color:var(--color-text)]">
        Back in a minute.
      </h1>
      <p className="text-[14px] text-[color:var(--color-text-dim)]">
        Playground is offline for a quick swap. No action needed on your end.
      </p>
      <p className="text-[14px] text-[color:var(--color-text-dim)]">
        The cookbook is open source and stays up while this site is down.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Btn kind="primary" href={COOKBOOK_URL} external>
          View the cookbook
        </Btn>
        <Btn kind="ghost" href="mailto:hello@mahimai.ca">
          hello@mahimai.ca
        </Btn>
      </div>
    </main>
  );
}
