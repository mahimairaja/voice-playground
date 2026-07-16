// @vitest-environment node
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { describe, expect, it } from 'vitest';
import {
  TUTORIAL_REHYPE_PLUGINS,
  WRITEUP_REHYPE_PLUGINS,
  WRITEUP_REMARK_PLUGINS,
} from './markdown';
import { extractToc } from './toc';

// Renders a writeup body exactly as the Writeup component does (same plugin
// list, same react-markdown), so the security contract is tested against the
// real config rather than a copy.
function render(body: string): string {
  return renderToStaticMarkup(
    createElement(ReactMarkdown, { rehypePlugins: WRITEUP_REHYPE_PLUGINS }, body)
  );
}

// Renders a tutorial body exactly as CookbookMarkdown does for /learn: the
// shared remark plugins plus the tutorial rehype plugins (slug, highlight,
// sanitize).
function renderTutorial(body: string): string {
  return renderToStaticMarkup(
    createElement(
      ReactMarkdown,
      { remarkPlugins: WRITEUP_REMARK_PLUGINS, rehypePlugins: TUTORIAL_REHYPE_PLUGINS },
      body
    )
  );
}

describe('writeup markdown rendering', () => {
  it('renders the markdown body to HTML server-side (crawlable)', () => {
    const html = render(
      '## Why this stack\n\nSome **bold** prose and a [link](https://example.com).'
    );
    expect(html).toContain('Why this stack');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('href="https://example.com"');
  });

  it('strips raw script and iframe from external-contributor markdown', () => {
    const html = render(
      'Intro paragraph.\n\n<script>alert(1)</script>\n\n<iframe src="https://evil.example"></iframe>\n\nOutro paragraph.'
    );
    expect(html).toContain('Intro paragraph');
    expect(html).toContain('Outro paragraph');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<iframe');
  });

  it('neutralizes javascript: links', () => {
    const html = render('[click me](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });
});

describe('tutorial markdown rendering', () => {
  it('gives a heading the id extractToc predicts (sanitize clobber prefix)', () => {
    const body = '## What you will build\n\ntext';
    const toc = extractToc(body);
    expect(toc[0].id).toBe('user-content-what-you-will-build');
    // The TOC anchor and scroll-spy only work if the rendered id matches.
    expect(renderTutorial(body)).toContain(`id="${toc[0].id}"`);
  });

  it('renders a callout blockquote with its type class and no marker text', () => {
    const html = renderTutorial('> [!TIP]\n> Keep money in cents.');
    expect(html).toContain('callout-tip');
    expect(html).toContain('Keep money in cents.');
    expect(html).not.toContain('[!TIP]');
  });

  it('strips raw script through the tutorial plugins too', () => {
    const html = renderTutorial('Intro.\n\n<script>alert(1)</script>\n\nOutro.');
    expect(html).toContain('Intro');
    expect(html).toContain('Outro');
    expect(html).not.toContain('<script');
  });
});
