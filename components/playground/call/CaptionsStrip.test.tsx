import { describe, expect, it } from 'vitest';
import type { UiInstance } from '@/lib/generative-ui/dispatcher';
import { selectCaptions } from './CaptionsStrip';

const instance = (props: Record<string, unknown>): Record<string, UiInstance> => ({
  captions: { id: 'captions', component: 'Captions', props, mountedAt: 0 },
});

describe('selectCaptions', () => {
  it('pulls the title and items from the Captions instance', () => {
    const { title, items } = selectCaptions(
      instance({ title: 'live captions', items: [{ text: 'hello', original: 'hola' }] })
    );
    expect(title).toBe('live captions');
    expect(items).toEqual([{ text: 'hello', original: 'hola' }]);
  });

  it('falls back to an empty caption list when none is mounted', () => {
    const { title, items } = selectCaptions({});
    expect(title).toBe('live captions');
    expect(items).toEqual([]);
  });
});
