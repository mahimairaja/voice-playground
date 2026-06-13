// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WriteupFrontmatterSchema, fetchWriteup, splitFrontmatter } from './blog';

const SAMPLE = `---
title: Test writeup
summary: A short summary
---
# Body

Some text.`;

describe('splitFrontmatter', () => {
  it('splits frontmatter and body', () => {
    const out = splitFrontmatter(SAMPLE);
    expect(out).not.toBeNull();
    expect(out!.raw.title).toBe('Test writeup');
    expect(out!.raw.summary).toBe('A short summary');
    expect(out!.body.startsWith('# Body')).toBe(true);
  });

  it('returns null without an opening fence', () => {
    expect(splitFrontmatter('title: no fence')).toBeNull();
  });

  it('returns null when the fence is unclosed', () => {
    expect(splitFrontmatter('---\ntitle: x\n')).toBeNull();
  });

  it('strips surrounding quotes and skips empty values', () => {
    const out = splitFrontmatter('---\ntitle: "Quoted"\nsummary: ok\ncover:\n---\nbody');
    expect(out!.raw.title).toBe('Quoted');
    expect(out!.raw.cover).toBeUndefined();
  });
});

describe('WriteupFrontmatterSchema', () => {
  it('defaults author to Mahimai', () => {
    const parsed = WriteupFrontmatterSchema.parse({ title: 'T', summary: 'S' });
    expect(parsed.author).toBe('Mahimai');
  });

  it('rejects missing title', () => {
    expect(WriteupFrontmatterSchema.safeParse({ summary: 'S' }).success).toBe(false);
  });

  it('drops a cover with a non-http scheme', () => {
    const parsed = WriteupFrontmatterSchema.parse({
      title: 'T',
      summary: 'S',
      cover: 'javascript:alert(1)',
    });
    expect(parsed.cover).toBeUndefined();
  });

  it('keeps a valid https cover', () => {
    const parsed = WriteupFrontmatterSchema.parse({
      title: 'T',
      summary: 'S',
      cover: 'https://example.com/a.png',
    });
    expect(parsed.cover).toBe('https://example.com/a.png');
  });
});

describe('fetchWriteup', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns a parsed writeup on 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(SAMPLE, { status: 200 }))
    );
    const w = await fetchWriteup('sample');
    expect(w?.frontmatter.title).toBe('Test writeup');
    expect(w?.frontmatter.author).toBe('Mahimai');
    expect(w?.body.startsWith('# Body')).toBe(true);
  });

  it('returns null on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('not found', { status: 404 }))
    );
    expect(await fetchWriteup('missing')).toBeNull();
  });

  it('returns null when frontmatter is malformed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('no frontmatter', { status: 200 }))
    );
    expect(await fetchWriteup('bad')).toBeNull();
  });
});
