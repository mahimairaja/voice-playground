import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VideoTile } from './VideoTile';
import type { Tile } from './tiles';

// A placeholder track ref (no publication/track) exercises the camera-off path.
const placeholderTile = (label: string): Tile => ({
  id: 'p1',
  isLocal: false,
  label,
  trackRef: { participant: { identity: 'p1', kind: 0 } } as never,
});

describe('VideoTile', () => {
  it('shows the label', () => {
    const html = renderToStaticMarkup(<VideoTile tile={placeholderTile('guest')} />);
    expect(html).toContain('guest');
  });

  it('renders a camera-off placeholder when there is no publication', () => {
    const html = renderToStaticMarkup(<VideoTile tile={placeholderTile('you')} />);
    expect(html).toContain('camera off');
  });
});
