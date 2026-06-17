import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ListPanel } from './ListPanel';

describe('ListPanel', () => {
  it('renders an initials avatar with a deterministic color when there is no image', () => {
    const html = renderToStaticMarkup(
      <ListPanel
        items={[{ title: 'Dr. Chen', subtitle: 'Fri Jun 13', right: '9:00 AM', avatar: 'CH' }]}
      />
    );
    expect(html).toContain('CH');
    expect(html).toContain('rounded-full');
    expect(html).toMatch(/hsl\(\d+ /);
  });

  it('gives different names different avatar colors', () => {
    const one = renderToStaticMarkup(<ListPanel items={[{ title: 'Chen', avatar: 'CH' }]} />);
    const two = renderToStaticMarkup(<ListPanel items={[{ title: 'Patel', avatar: 'PA' }]} />);
    const hue = (html: string) => html.match(/hsl\((\d+) /)?.[1];
    expect(hue(one)).not.toBe(hue(two));
  });

  it('prefers an image over the initials avatar', () => {
    const html = renderToStaticMarkup(
      <ListPanel items={[{ title: 'x', image_url: 'https://example.test/x.png', avatar: 'XX' }]} />
    );
    expect(html).toContain('https://example.test/x.png');
    expect(html).not.toContain('rounded-full');
  });
});
