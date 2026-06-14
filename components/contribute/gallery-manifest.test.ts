import { describe, expect, it, vi } from 'vitest';
// Importing the vocabulary runs registerGlobal(), populating the registry.
import '@/components/demos/_vocabulary';
import { listComponents, resolve } from '@/lib/generative-ui/registry';
import { GALLERY } from './gallery-manifest';

// ListPanel (used by List/Order) imports next/link. The test only references
// component identities (never renders), so stub next/link to keep the import
// graph clean in jsdom without a Next router context.
vi.mock('next/link', () => ({ default: ({ children }: { children: unknown }) => children }));

const SLUG = '__gallery_test__'; // unregistered slug -> resolve/list fall back to the global vocabulary
const registered = new Set(listComponents(SLUG));
const galleryNames = new Set(GALLERY.map((e) => e.name));

describe('contribute gallery manifest', () => {
  it('shows every globally registered component (no gaps)', () => {
    const missing = [...registered].filter((n) => !galleryNames.has(n));
    expect(missing).toEqual([]);
  });

  it('references no name that is not registered', () => {
    const extra = [...galleryNames].filter((n) => !registered.has(n));
    expect(extra).toEqual([]);
  });

  it('resolves every gallery name through the registry', () => {
    for (const entry of GALLERY) {
      expect(resolve(SLUG, entry.name)).toBeTypeOf('function');
    }
  });

  it('gives every entry sample props and prop hints', () => {
    for (const entry of GALLERY) {
      expect(Object.keys(entry.sampleProps).length).toBeGreaterThan(0);
      expect(entry.propHints.length).toBeGreaterThan(0);
    }
  });
});
