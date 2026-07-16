import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified';
import { remarkCallouts } from './callouts';

/**
 * Remark and rehype pipelines for rendering cookbook writeup and tutorial
 * bodies.
 *
 * react-markdown runs with no rehype-raw, so raw HTML in a body is never parsed
 * into the tree. The ONLY source of class and id attributes is our own trusted
 * plugins: rehype-slug adds heading ids (so the tutorial TOC anchors line up),
 * rehype-highlight wraps code in hljs spans, and remark-callouts tags a callout
 * blockquote. The untrusted markdown cannot inject any of them, so extending the
 * sanitize allowlist with heading `id` and code/span/blockquote `className` is
 * safe. Sanitize runs last and stays load-bearing for everything else; bodies
 * come from a public cookbook with external contributors. Shared so the security
 * schema cannot drift.
 */
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className'],
    blockquote: [...(defaultSchema.attributes?.blockquote ?? []), 'className'],
    h2: [...(defaultSchema.attributes?.h2 ?? []), 'id'],
    h3: [...(defaultSchema.attributes?.h3 ?? []), 'id'],
    h4: [...(defaultSchema.attributes?.h4 ?? []), 'id'],
  },
};

// ignoreMissing keeps an unregistered language (for example toml) from erroring;
// that block renders as plain monospace instead.
const highlight: PluggableList[number] = [rehypeHighlight, { ignoreMissing: true }];

// GFM (clickable links, tables) plus the callout transform. Shared by the short
// blog and the full tutorial.
export const WRITEUP_REMARK_PLUGINS: PluggableList = [remarkGfm, remarkCallouts];

// Short blog on the demo page: syntax-highlighted code, then sanitize.
export const WRITEUP_REHYPE_PLUGINS: PluggableList = [highlight, [rehypeSanitize, schema]];

// Full tutorial page: heading ids for the TOC, highlight, then sanitize.
export const TUTORIAL_REHYPE_PLUGINS: PluggableList = [
  rehypeSlug,
  highlight,
  [rehypeSanitize, schema],
];
