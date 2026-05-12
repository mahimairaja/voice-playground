import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 · voice playground',
  description: 'The page you tried to visit does not exist.',
};

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start px-6 pt-28 pb-16">
      <div className="ab brand-accent relative w-full">
        <div className="ab-head">
          <span className="label">/404</span>
          <span className="meta">page not found</span>
        </div>
        <div className="ab-body" style={{ padding: 28 }}>
          <p className="tiny-mono">{'// no-route'}</p>
          <h1 className="h-hand xxl mt-3 leading-[0.95]">
            That page <br />
            doesn&apos;t live <br />
            here.
          </h1>
          <p className="p-hand mt-5 max-w-md">
            We may have moved it, the link may be old, or the URL may be a typo. Either way, the
            playground keeps working.
          </p>
          <div className="line wavy mt-5 max-w-xs"></div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/" className="btn accent brand-accent">
              Back to home →
            </Link>
            <Link href="/demos" className="btn">
              Try a demo →
            </Link>
          </div>
        </div>
        <span className="stamp">404 · NOT FOUND</span>
      </div>
    </main>
  );
}
