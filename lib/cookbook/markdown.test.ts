// @vitest-environment node
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { describe, expect, it } from 'vitest';
import { WRITEUP_REHYPE_PLUGINS } from './markdown';

// Renders a writeup body exactly as the Writeup component does (same plugin
// list, same react-markdown), so the security contract is tested against the
// real config rather than a copy.
function render(body: string): string {
  return renderToStaticMarkup(
    createElement(ReactMarkdown, { rehypePlugins: WRITEUP_REHYPE_PLUGINS }, body)
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
