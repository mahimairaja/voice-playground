'use client';

import { Streamdown } from 'streamdown';
import { Eyebrow } from '@/components/phosphor';
import type { Writeup as WriteupData } from '@/lib/cookbook/blog';

interface WriteupProps {
  writeup: WriteupData;
}

const PROSE =
  'mt-6 max-w-[68ch] text-[15px] leading-[1.7] text-[color:var(--color-text-dim)] ' +
  '[&_a]:text-[color:var(--color-accent-dim)] [&_a]:underline ' +
  '[&_code]:font-mono [&_code]:text-[13px] ' +
  '[&_h2]:mt-8 [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:text-[color:var(--color-text)] ' +
  '[&_h3]:mt-6 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-[color:var(--color-text)] ' +
  '[&_p]:mt-4 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 ' +
  '[&_li]:mt-1.5 [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[color:var(--color-border)] [&_blockquote]:pl-4 ' +
  '[&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius-panel)] [&_pre]:border ' +
  '[&_pre]:border-[color:var(--color-border)] [&_pre]:bg-[color:color-mix(in_srgb,var(--color-border)_12%,transparent)] [&_pre]:p-4 ' +
  '[&_img]:mt-4 [&_img]:rounded-[var(--radius-panel)]';

/**
 * The build-writeup section below the live demo on /demos/<slug>. Client
 * component: Streamdown uses useState, useEffect, and other hooks internally,
 * so this must run on the client. Streamdown does not emit raw HTML, so no
 * extra sanitizer is needed. The frozen markdown subset is documented in the
 * cookbook's AGENTS.md.
 */
export function Writeup({ writeup }: WriteupProps) {
  const { frontmatter, body } = writeup;
  return (
    <section className="mx-auto w-full max-w-[1180px] px-6 pb-20">
      <div className="border-t border-[color:var(--color-border)] pt-10">
        <Eyebrow>build writeup</Eyebrow>
        {frontmatter.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frontmatter.cover}
            alt=""
            className="mt-4 w-full rounded-[var(--radius-panel)] border border-[color:var(--color-border)]"
          />
        ) : null}
        <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
          {frontmatter.title}
        </h2>
        <p className="mt-1.5 font-mono text-[12px] tracking-[0.04em] text-[color:var(--color-text-mute)]">
          by {frontmatter.author}
        </p>
        <div className={PROSE}>
          <Streamdown>{body}</Streamdown>
        </div>
      </div>
    </section>
  );
}
