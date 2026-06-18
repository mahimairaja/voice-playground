import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NewBadge } from './NewBadge';

describe('NewBadge', () => {
  it('renders the new marker as an amber pill', () => {
    const html = renderToStaticMarkup(<NewBadge />);
    expect(html).toContain('new');
    expect(html).toContain('rounded-[var(--radius-pill)]');
    expect(html).toContain('--color-accent');
  });
});
