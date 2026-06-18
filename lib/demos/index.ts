import 'server-only';
import { fetchCatalog, fetchDemoBySlug } from '@/lib/cookbook/manifest';
import { type CatalogEntry } from '@/lib/cookbook/schema';
import { PLANNED_DEMOS, type PlannedDemo } from './planned';
import { compareByReleasedDesc } from './released';
import { stackProviders } from './stack';

/**
 * Thin adapter over the cookbook fetcher. Routes call these to render
 * shipped + planned demos. Every accessor is async because the underlying
 * fetch runs on each request (Next caches it for ~5 minutes).
 *
 * Shipped: from 'lib/cookbook/manifest.fetchCatalog()'.
 * Planned: from 'lib/demos/planned.PLANNED_DEMOS'.
 *
 * 'CatalogFetchError' bubbles up from the cookbook fetcher; callers should
 * render '<CatalogError>' at the route boundary instead of catching here.
 */

export type ShippedDemo = CatalogEntry;
export type { PlannedDemo };

export type DemoCard =
  | (ShippedDemo & { status: 'shipped' })
  | (PlannedDemo & { status: 'planned' });

export async function getAllShipped(): Promise<readonly ShippedDemo[]> {
  const shipped = await fetchCatalog();
  return [...shipped].sort(compareByReleasedDesc);
}

export function getAllPlanned(): readonly PlannedDemo[] {
  return PLANNED_DEMOS;
}

export async function getAllDemos(): Promise<readonly DemoCard[]> {
  const shipped = await getAllShipped();
  return [
    ...shipped.map((d) => ({ ...d, status: 'shipped' as const })),
    ...PLANNED_DEMOS.map((d) => ({ ...d, status: 'planned' as const })),
  ];
}

export async function getShippedBySlug(slug: string): Promise<ShippedDemo | undefined> {
  return fetchDemoBySlug(slug);
}

/**
 * Categories that appear in at least one shipped or planned demo. Sorted
 * alphabetically. Used for the demos-index filter pill row.
 */
export async function getDemoCategories(): Promise<readonly string[]> {
  const shipped = await fetchCatalog();
  const categories = new Set<string>();
  for (const d of shipped) categories.add(d.category);
  for (const d of PLANNED_DEMOS) categories.add(d.category);
  return Array.from(categories).sort();
}

/**
 * Providers that appear in at least one shipped demo's stack, sorted. Powers
 * the demos-page provider filter chip row. Planned demos carry no stack.
 */
export async function getDemoProviders(): Promise<readonly string[]> {
  const shipped = await fetchCatalog();
  const providers = new Set<string>();
  for (const d of shipped) for (const p of stackProviders(d.stack)) providers.add(p);
  return Array.from(providers).sort();
}
