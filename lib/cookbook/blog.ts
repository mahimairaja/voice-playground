import 'server-only';
import { z } from 'zod';
import { COOKBOOK_REVALIDATE_TAG } from './manifest';
import { blogRawUrl } from './url';

const REVALIDATE_SECONDS = 300;

export const WriteupFrontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  // cover is rendered as an <img src>; require an http(s) URL so an external
  // contributor cannot point it at javascript:, data:, or another scheme
  // (.url() alone accepts those). A bad value falls back to undefined (the
  // image is dropped) rather than failing the whole writeup.
  cover: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//i.test(u), 'cover must be an http(s) URL')
    .optional()
    .catch(undefined),
  canonical: z.string().url().optional().catch(undefined),
  author: z.string().min(1).default('Mahimai'),
});

export type WriteupFrontmatter = z.infer<typeof WriteupFrontmatterSchema>;

export interface Writeup {
  frontmatter: WriteupFrontmatter;
  body: string;
}

/**
 * Split a blog.md into its flat frontmatter map and markdown body. Returns
 * null when the leading --- fence or its closing fence is missing. Empty
 * values and lines without a colon are skipped; one layer of surrounding
 * quotes is stripped. Hand-parsed on purpose: the key set is closed and
 * flat, so there is no need for a YAML dependency.
 */
export function splitFrontmatter(
  text: string
): { raw: Record<string, string>; body: string } | null {
  if (!text.startsWith('---')) return null;
  const lines = text.split('\n');
  let closing = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      closing = i;
      break;
    }
  }
  if (closing === -1) return null;

  const raw: Record<string, string> = {};
  for (const line of lines.slice(1, closing)) {
    if (!line.trim()) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      value.length >= 2 &&
      value[0] === value[value.length - 1] &&
      (value[0] === '"' || value[0] === "'")
    ) {
      value = value.slice(1, -1);
    }
    if (value) raw[key] = value;
  }

  const body = lines
    .slice(closing + 1)
    .join('\n')
    .trim();
  return { raw, body };
}

/**
 * Fetch and parse a demo's writeup from the cookbook. Returns null on any
 * failure path (missing file, malformed frontmatter, network) so the demo
 * page degrades to no writeup rather than erroring. Mirrors manifest.ts:
 * same 5-minute cache and 'cookbook' revalidation tag.
 */
export async function fetchWriteup(slug: string): Promise<Writeup | null> {
  let res: Response;
  try {
    res = await fetch(blogRawUrl(slug), {
      next: { revalidate: REVALIDATE_SECONDS, tags: [COOKBOOK_REVALIDATE_TAG] },
    });
  } catch {
    console.warn(`[cookbook] writeup fetch failed for "${slug}"`);
    return null;
  }

  if (!res.ok) {
    if (res.status !== 404) {
      console.warn(`[cookbook] writeup HTTP ${res.status} for "${slug}"`);
    }
    return null;
  }

  const text = await res.text();
  const split = splitFrontmatter(text);
  if (!split) {
    console.warn(`[cookbook] writeup frontmatter malformed for "${slug}"`);
    return null;
  }

  const parsed = WriteupFrontmatterSchema.safeParse(split.raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.message).join('; ');
    console.warn(`[cookbook] writeup frontmatter invalid for "${slug}": ${issues}`);
    return null;
  }

  return { frontmatter: parsed.data, body: split.body };
}
