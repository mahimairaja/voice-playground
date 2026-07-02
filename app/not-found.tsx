import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 · voice playground',
  description: 'The page you tried to visit does not exist.',
};

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-[520px] flex-col gap-4 px-6 py-24">
      <span className="text-xs font-bold tracking-widest text-[color:var(--color-text-mute)] uppercase">
        404 · No route
      </span>
      <h1 className="text-[28px] font-bold tracking-tight text-[color:var(--color-text)]">
        That page doesn&apos;t live here.
      </h1>
      <p className="text-[15px] text-[color:var(--color-text-dim)]">
        We may have moved it, or the URL is a typo. The playground keeps working.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Link
          href="/demos"
          className="rounded-[var(--radius-button)] bg-[color:var(--color-accent)] px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-accent-dim)]"
        >
          Back to demos
        </Link>
        <Link
          href="/"
          className="rounded-[var(--radius-button)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-[18px] py-2.5 text-sm font-semibold text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface-2)]"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
