import 'server-only';
import { type CatalogEntry, CatalogPayloadSchema, type CatalogValue } from './schema';
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

function reshape(payload: Record<string, CatalogValue>): CatalogEntry[] {
  return Object.entries(payload)
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
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

  const parsed = CatalogPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; ');
    throw new CatalogFetchError('parse', `catalog.json failed schema validation: ${issues}`);
  }

  return reshape(parsed.data);
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
