import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 · voice playground',
  description: 'The page you tried to visit does not exist.',
};

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-[520px] flex-col gap-4 px-6 py-24">
      <span className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
        {'// 404 · NO ROUTE'}
      </span>
      <h1 className="text-[28px] font-semibold tracking-tight text-[color:var(--color-text)]">
        That page doesn&apos;t live here.
      </h1>
      <p className="text-[14px] text-[color:var(--color-text-dim)]">
        We may have moved it, or the URL is a typo. The playground keeps working.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Link
          href="/demos"
          className="rounded-[var(--radius-button)] bg-[color:var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-[color:var(--color-bg)] hover:opacity-90"
        >
          → Back to demos
        </Link>
        <Link
          href="/"
          className="rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-4 py-2 text-[13px] text-[color:var(--color-text)] hover:border-[color:var(--color-border-strong)]"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
