import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MetersPanel } from './MetersPanel';

const items = [
  { label: 'noise', value: 0.8, band: 'bad' as const, driver: true },
  { label: 'loudness', value: 0.5, neutral: true },
];

describe('MetersPanel', () => {
  it('renders one bar per item with width from value', () => {
    const html = renderToStaticMarkup(<MetersPanel title="audio health" items={items} />);
    expect(html).toContain('data-meter="noise"');
    expect(html).toContain('width:80%');
    expect(html).toContain('0.80');
  });

  it('colors a degradation bar by band and marks the driver', () => {
    const html = renderToStaticMarkup(<MetersPanel items={items} />);
    expect(html).toContain('var(--color-danger)');
    expect(html).toContain('data-driver');
  });

  it('renders the neutral row uncolored, never a band color', () => {
    const html = renderToStaticMarkup(
      <MetersPanel items={[{ label: 'loudness', value: 0.9, neutral: true }]} />
    );
    expect(html).toContain('data-neutral');
    expect(html).toContain('var(--color-text-mute)');
    expect(html).not.toContain('var(--color-danger)');
  });
});
