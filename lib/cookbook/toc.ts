import GithubSlugger from 'github-slugger';

export interface TocItem {
  depth: 2 | 3;
  text: string;
  id: string;
}

// rehype-sanitize's default schema clobbers id/name attributes with this
// prefix, so a rendered heading id is 'user-content-<slug>'. The TOC ids must
// carry the same prefix or the anchor links and the scroll-spy break. Locked to
// the sanitize default by a test in markdown.test.ts.
const CLOBBER_PREFIX = 'user-content-';

/**
 * Extract a table of contents from a tutorial markdown body: the ## and ###
 * headings, each with a github-slugger id. The ids match rehype-slug's output
 * (rehype-slug uses github-slugger too), so a TOC anchor lines up with the
 * rendered heading id. Fenced code blocks are skipped, so a '## comment' inside
 * a code sample never becomes a heading. Pure and synchronous, unit-tested.
 */
export function extractToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let fence: string | null = null;

  for (const line of body.split('\n')) {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (marker === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;

    const heading = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;
    const depth = heading[1].length as 2 | 3;
    // Strip inline code backticks so the label and slug read cleanly; the
    // tutorials keep headings plain, but this stays robust if one gains code.
    const text = heading[2].replace(/`/g, '').trim();
    if (!text) continue;
    items.push({ depth, text, id: CLOBBER_PREFIX + slugger.slug(text) });
  }

  return items;
}
