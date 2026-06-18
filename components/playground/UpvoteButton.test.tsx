import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { UpvoteButton } from './UpvoteButton';

describe('UpvoteButton', () => {
  it('renders nothing without a votes provider (graceful off)', () => {
    expect(renderToStaticMarkup(<UpvoteButton slug="drive-thru-coffee" />)).toBe('');
  });
});
