// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { extractToc } from './toc';

describe('extractToc', () => {
  it('extracts ## and ### headings with slugged ids', () => {
    const toc = extractToc('## What you will build\n\ntext\n\n### A subsection\n');
    expect(toc).toEqual([
      { depth: 2, text: 'What you will build', id: 'user-content-what-you-will-build' },
      { depth: 3, text: 'A subsection', id: 'user-content-a-subsection' },
    ]);
  });

  it('skips headings inside fenced code blocks', () => {
    const toc = extractToc('## Real\n\n```py\n## not a heading\n```\n\n## Also real');
    expect(toc.map((t) => t.text)).toEqual(['Real', 'Also real']);
  });

  it('ignores h1 and h4', () => {
    const toc = extractToc('# Title\n#### Deep\n## Kept');
    expect(toc.map((t) => t.text)).toEqual(['Kept']);
  });

  it('deduplicates ids for repeated headings, matching rehype-slug', () => {
    const toc = extractToc('## Run it\n## Run it');
    expect(toc.map((t) => t.id)).toEqual(['user-content-run-it', 'user-content-run-it-1']);
  });

  it('strips inline code backticks from the label and slug', () => {
    const toc = extractToc('## The `record_field` tool');
    expect(toc[0]).toEqual({
      depth: 2,
      text: 'The record_field tool',
      id: 'user-content-the-record_field-tool',
    });
  });
});
