import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AuthorByline } from './AuthorByline';

describe('AuthorByline', () => {
  it('shows the avatar and links the name to the profile when github is set', () => {
    const html = renderToStaticMarkup(<AuthorByline author="Mahimai" github="mahimairaja" />);
    expect(html).toContain('https://github.com/mahimairaja.png');
    expect(html).toContain('href="https://github.com/mahimairaja"');
    expect(html).toContain('rounded-full');
    expect(html).toContain('Mahimai');
  });

  it('is a plain byline with no image or link when github is absent', () => {
    const html = renderToStaticMarkup(<AuthorByline author="Mahimai" />);
    expect(html).toContain('by Mahimai');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<a');
  });
});
