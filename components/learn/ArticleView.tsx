import Link from 'next/link';
import { ReadingProgress } from '@/components/learn/ReadingProgress';
import { TableOfContents } from '@/components/learn/TableOfContents';
import { Eyebrow } from '@/components/phosphor/Eyebrow';
import { AuthorByline } from '@/components/playground/AuthorByline';
import { CookbookMarkdown } from '@/components/playground/CookbookMarkdown';
import type { Writeup } from '@/lib/cookbook/blog';
import { extractToc } from '@/lib/cookbook/toc';

/**
 * The full "How to build" tutorial page at /learn/<slug>: a reading-progress
 * bar, a back link to the demo, the title and summary, the article body, and a
 * sticky sidebar table of contents. Server component; the TOC and progress bar
 * are the only client pieces.
 */
export function ArticleView({
  writeup,
  slug,
  demoTitle,
}: {
  writeup: Writeup;
  slug: string;
  demoTitle: string;
}) {
  const { frontmatter, body } = writeup;
  const toc = extractToc(body);

  return (
    <>
      <ReadingProgress />
      <article className="mx-auto w-full max-w-[1180px] px-6 py-12 lg:py-16">
        <Link
          href={`/demos/${slug}`}
          className="text-[13px] text-[color:var(--color-accent-dim)] hover:underline"
        >
          <span aria-hidden>&larr;</span> Back to the {demoTitle} demo
        </Link>

        <header className="mt-4 max-w-[70ch]">
          <Eyebrow>full tutorial</Eyebrow>
          <h1 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">
            {frontmatter.title}
          </h1>
          <p className="mt-3 text-[16px] text-[color:var(--color-text-dim)]">
            {frontmatter.summary}
          </p>
          <AuthorByline author={frontmatter.author} github={frontmatter.github} />
        </header>

        <div className="mt-10 lg:grid lg:grid-cols-[1fr_14rem] lg:gap-12">
          <div className="max-w-[70ch] min-w-0">
            <CookbookMarkdown body={body} variant="tutorial" />
          </div>
          {toc.length > 0 ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents items={toc} />
              </div>
            </aside>
          ) : null}
        </div>
      </article>
    </>
  );
}
