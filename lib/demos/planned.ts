import type { Category } from '@/lib/cookbook/schema';

/**
 * Hand-curated list of upcoming demos. Renders on the landing and demos
 * index as dimmed placeholder cards alongside the shipped demos pulled
 * from the cookbook catalog.
 *
 * Each entry is deleted from this file when its shipped counterpart lands
 * in 'awesome-voice-apps/catalog.json'. The cookbook is always the source
 * of truth for what is real; this list is the source of truth for what is
 * coming.
 */

export interface PlannedDemo {
  slug: string;
  title: string;
  category: Category;
  /** ISO-8601 month-precision string, e.g. '2026-09'. */
  target_date: string;
  /** Usually a draft PR or tracking issue in the cookbook. Opens in new tab. */
  github_link: string;
  /** One-line "what this demo proves" — body copy on the dimmed card. */
  why: string;
}

export const PLANNED_DEMOS: readonly PlannedDemo[] = [];
