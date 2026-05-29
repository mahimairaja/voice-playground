import 'server-only';
import { type CatalogEntry, CatalogValueSchema, SlugSchema } from './schema';
import { CATALOG_URL } from './url';

/**
 * Server-only catalog fetcher. Reads the cookbook's 'catalog.json' from
 * GitHub Raw with a 5-minute Next.js cache. Throws a typed
 * 'CatalogFetchError' so callers can render an explicit fallback instead
 * of silently degrading.
 *
 * The 'cookbook' revalidation tag is exported so a future webhook endpoint
 * can call 'revalidateTag('cookbook')' to refresh on push.
 */

export const COOKBOOK_REVALIDATE_TAG = 'cookbook';
const REVALIDATE_SECONDS = 300;

export type CatalogFetchErrorCause = 'network' | 'http' | 'parse';

export class CatalogFetchError extends Error {
  constructor(
    public readonly cause: CatalogFetchErrorCause,
    message: string
  ) {
    super(message);
    this.name = 'CatalogFetchError';
  }
}

/**
 * Validates the payload one entry at a time so a single malformed demo drops
 * only its own card instead of taking the whole catalog offline. A bad slug
 * key or a value that fails the schema is skipped with one console.warn; the
 * conformant demos survive. Only a payload that is not a JSON object keyed by
 * slug is fatal, since there is then nothing to salvage.
 */
function parseEntries(raw: unknown): CatalogEntry[] {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new CatalogFetchError('parse', 'catalog.json was not a JSON object keyed by slug');
  }

  const entries: CatalogEntry[] = [];
  for (const [slug, value] of Object.entries(raw as Record<string, unknown>)) {
    const slugCheck = SlugSchema.safeParse(slug);
    const valueCheck = CatalogValueSchema.safeParse(value);
    if (!slugCheck.success || !valueCheck.success) {
      const issues = [
        ...(slugCheck.success ? [] : slugCheck.error.issues),
        ...(valueCheck.success ? [] : valueCheck.error.issues),
      ]
        .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('; ');
      console.warn(`[cookbook] skipping malformed catalog entry "${slug}": ${issues}`);
      continue;
    }
    entries.push({ slug, ...valueCheck.data });
  }

  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Fetches and validates the catalog. Throws on any failure path so the
 * caller's route boundary can render '<CatalogError>'.
 */
export async function fetchCatalog(): Promise<CatalogEntry[]> {
  let res: Response;
  try {
    res = await fetch(CATALOG_URL, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [COOKBOOK_REVALIDATE_TAG] },
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown error';
    throw new CatalogFetchError('network', `could not reach cookbook: ${reason}`);
  }

  if (!res.ok) {
    throw new CatalogFetchError('http', `cookbook returned HTTP ${res.status}`);
  }

  let raw: unknown;
  try {
    raw = await res.json();
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown error';
    throw new CatalogFetchError('parse', `catalog.json was not valid JSON: ${reason}`);
  }

  return parseEntries(raw);
}

/**
 * Convenience over 'fetchCatalog' for slug lookups. Returns undefined when
 * the slug is not in the catalog; throws 'CatalogFetchError' for fetch /
 * schema failures.
 */
export async function fetchDemoBySlug(slug: string): Promise<CatalogEntry | undefined> {
  const all = await fetchCatalog();
  return all.find((demo) => demo.slug === slug);
}
