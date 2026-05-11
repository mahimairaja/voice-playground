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
    <main className="mx-auto flex max-w-3xl flex-col items-start px-6 pt-28 pb-16">
      <div className="ab brand-accent relative w-full">
        <div className="ab-head">
          <span className="label">/error</span>
          <span className="meta">{error.digest ? `digest ${error.digest}` : 'unhandled'}</span>
        </div>
        <div className="ab-body" style={{ padding: 28 }}>
          <p className="tiny-mono">{'// route-error'}</p>
          <h1 className="h-hand xxl mt-3 leading-[0.95]">
            Something <br />
            broke.
          </h1>
          <p className="p-hand mt-5 max-w-md">
            The playground logged it locally. Hitting retry usually works. If it keeps happening,
            open an issue on the{' '}
            <a
              href="https://github.com/mahimairaja/voice-playground/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              source repo
            </a>
            .
          </p>
          {IS_DEV && error.message && (
            <pre
              className="mt-5 overflow-x-auto p-3 text-xs"
              style={{
                fontFamily: 'var(--mono)',
                background: 'var(--paper-2)',
                border: '1.2px dashed var(--line-soft)',
                borderRadius: 4,
                color: 'var(--ink-2)',
              }}
            >
              {error.message}
            </pre>
          )}
          <div className="line wavy mt-5 max-w-xs"></div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="btn accent brand-accent cursor-pointer"
            >
              Try again →
            </button>
            <Link href="/" className="btn">
              Back to home →
            </Link>
          </div>
        </div>
        <span className="stamp">ERROR</span>
      </div>
    </main>
  );
}
