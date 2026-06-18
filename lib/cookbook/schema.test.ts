import { describe, expect, it } from 'vitest';
import { CatalogValueSchema } from './schema';

const base = {
  title: 'X',
  category: 'restaurant',
  description: 'd',
  who_for: 'w',
  recording_url: null,
  ui_components: ['Order'],
};

describe('CatalogValueSchema released', () => {
  it('keeps a valid released date', () => {
    expect(CatalogValueSchema.parse({ ...base, released: '2026-06-15' }).released).toBe(
      '2026-06-15'
    );
  });

  it('drops a malformed released to undefined without failing the entry', () => {
    const parsed = CatalogValueSchema.parse({ ...base, released: 'June 15' });
    expect(parsed.released).toBeUndefined();
    expect(parsed.title).toBe('X');
  });

  it('leaves released undefined when absent', () => {
    expect(CatalogValueSchema.parse(base).released).toBeUndefined();
  });
});
