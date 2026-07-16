import ReactMarkdown from 'react-markdown';
import {
  TUTORIAL_REHYPE_PLUGINS,
  WRITEUP_REHYPE_PLUGINS,
  WRITEUP_REMARK_PLUGINS,
} from '@/lib/cookbook/markdown';

/**
 * Renders a cookbook markdown body (short blog or full tutorial) with the shared
 * remark pipeline (GFM plus callouts) and the variant's rehype pipeline. Server
 * component: react-markdown renders synchronously during SSR, so the body lands
 * in the initial HTML and is crawlable. There is no rehype-raw, so raw HTML is
 * never parsed into the tree, and rehype-sanitize strips anything outside the
 * safe set. Bodies come from a public cookbook with external contributors, so
 * that sanitization is load-bearing (see lib/cookbook/markdown.ts).
 */
export function CookbookMarkdown({
  body,
  variant,
}: {
  body: string;
  variant: 'blog' | 'tutorial';
}) {
  const rehypePlugins = variant === 'tutorial' ? TUTORIAL_REHYPE_PLUGINS : WRITEUP_REHYPE_PLUGINS;
  return (
    <div className="cookbook-prose">
      <ReactMarkdown remarkPlugins={WRITEUP_REMARK_PLUGINS} rehypePlugins={rehypePlugins}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
