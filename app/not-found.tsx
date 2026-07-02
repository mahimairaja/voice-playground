import type { Metadata } from 'next';
import { Btn } from '@/components/phosphor';

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
        <Btn kind="primary" href="/demos">
          Back to demos
        </Btn>
        <Btn kind="ghost" href="/">
          Home
        </Btn>
      </div>
    </main>
  );
}
