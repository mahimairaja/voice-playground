import { Eyebrow } from '@/components/phosphor/Eyebrow';
import { AuthorByline } from '@/components/playground/AuthorByline';
import { CookbookMarkdown } from '@/components/playground/CookbookMarkdown';
import type { Writeup as WriteupData } from '@/lib/cookbook/blog';

interface WriteupProps {
  writeup: WriteupData;
  /** When the demo has a tutorial.md, the /learn/<slug> link to it. */
  tutorialHref?: string;
}

/**
 * The short build-along below the live demo on /demos/<slug>. Server component:
 * the markdown body renders through CookbookMarkdown (react-markdown, no
 * rehype-raw, rehype-sanitize is load-bearing since bodies come from external
 * contributors). When a full tutorial exists, a link points readers to it.
 */
export function Writeup({ writeup, tutorialHref }: WriteupProps) {
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
        <AuthorByline author={frontmatter.author} github={frontmatter.github} />
        <div className="mt-6 max-w-[68ch]">
          <CookbookMarkdown body={body} variant="blog" />
        </div>
        {tutorialHref ? (
          <a
            href={tutorialHref}
            className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--color-accent-dim)] hover:underline"
          >
            Read the full walkthrough
            <span aria-hidden>&rarr;</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
