// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseCalloutMarker, remarkCallouts } from './callouts';

describe('parseCalloutMarker', () => {
  it('parses a known marker and returns the rest', () => {
    expect(parseCalloutMarker('[!TIP] be careful')).toEqual({ type: 'tip', rest: 'be careful' });
  });

  it('eats a trailing newline so the body follows cleanly', () => {
    expect(parseCalloutMarker('[!NOTE]\nBody text')).toEqual({ type: 'note', rest: 'Body text' });
  });

  it('is case-insensitive on the type', () => {
    expect(parseCalloutMarker('[!warning] x')?.type).toBe('warning');
  });

  it('returns null for a plain quote and an unknown marker', () => {
    expect(parseCalloutMarker('just a quote')).toBeNull();
    expect(parseCalloutMarker('[!HINT] x')).toBeNull();
  });
});

describe('remarkCallouts', () => {
  it('tags a callout blockquote and strips the marker', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            { type: 'paragraph', children: [{ type: 'text', value: '[!NOTE]\nBody text' }] },
          ],
        },
      ],
    };
    remarkCallouts()(tree);
    const bq = tree.children[0];
    expect(bq.data?.hProperties?.className).toEqual(['callout', 'callout-note']);
    expect(bq.children[0].children[0].value).toBe('Body text');
  });

  it('leaves a plain blockquote untouched', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'plain' }] }],
        },
      ],
    };
    remarkCallouts()(tree);
    expect(tree.children[0].data).toBeUndefined();
  });
});
