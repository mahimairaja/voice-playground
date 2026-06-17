import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CardPanel } from './CardPanel';

describe('CardPanel', () => {
  it('offers a popup and clamps when the body is long', () => {
    const body = 'A renter has a right to reasonable privacy in their home. '.repeat(6);
    const html = renderToStaticMarkup(
      <CardPanel title="Landlord entry and notice" subtitle="HUD guidance" body={body} />
    );
    expect(html).toContain('Read full passage');
    expect(html).toContain('line-clamp-3');
  });

  it('renders a short body inline with no popup', () => {
    const html = renderToStaticMarkup(<CardPanel title="One moment" body="Please try again." />);
    expect(html).not.toContain('Read full passage');
    expect(html).not.toContain('line-clamp-3');
  });
});
