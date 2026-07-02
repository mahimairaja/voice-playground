'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const IS_DEV = process.env.NODE_ENV !== 'production';

export default function RouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    console.error('[playground] route error:', error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-[520px] flex-col gap-4 px-6 py-24">
      <span className="text-xs font-bold tracking-widest text-[color:var(--color-danger)] uppercase">
        {`Error · ${error.digest ?? 'unhandled'}`}
      </span>
      <h1 className="text-[28px] font-bold tracking-tight text-[color:var(--color-text)]">
        Something broke.
      </h1>
      <p className="text-[15px] text-[color:var(--color-text-dim)]">
        We logged it. Retry usually works. If it keeps happening, mail{' '}
        <a
          href="mailto:hello@mahimai.ca"
          className="text-[color:var(--color-accent-dim)] underline-offset-4 hover:underline"
        >
          hello@mahimai.ca
        </a>
        .
      </p>
      {IS_DEV && error.message ? (
        <pre className="overflow-x-auto rounded-[var(--radius-input)] border border-[color:var(--color-border-dim)] bg-[color:var(--color-surface-2)] p-3 font-mono text-[11px] text-[color:var(--color-text-dim)]">
          {error.message}
        </pre>
      ) : null}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-[var(--radius-button)] bg-[color:var(--color-accent)] px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-accent-dim)]"
        >
          Try again
        </button>
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
