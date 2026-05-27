import 'server-only';
import bakedRaw from './_generated.json';
import {
  REFERENCE_CATEGORIES,
  REFERENCE_CORKBOARD_CARDS,
  REFERENCE_DEMO_MANIFEST,
  REFERENCE_LANDING_CARDS,
  REFERENCE_PINNED_COUNT,
  type ReferenceCorkboardCard,
  type ReferencePreviewCard,
} from './reference-data';
import { type DemoManifest, DemoManifestSchema } from './schema';

/**
 * Loader output. The schema allows 'slug' to be omitted (in which case the
 * folder name is the slug); the bake step normalizes that, so consumers can
 * rely on 'slug' always being present.
 */
export type LoadedDemoManifest = DemoManifest & { slug: string };

/**
 * Build-time demo manifests, baked from the awesome-voice-apps cookbook by
 * 'scripts/sync-demos.mjs' (the 'prebuild' hook) into
 * 'lib/demos/_generated.json'. The loader imports that JSON statically so
 * the manifests ride along inside the deploy artifacts: a Vercel serverless
 * function does not have access to the sibling clone target at runtime, so
 * any 'fs.readdirSync(<sibling>)' read would silently return empty and fall
 * back to the reference seed.
 *
 * If the bake step did not run (e.g. someone hand-typechecked without the
 * sibling repo cloned), '_generated.json' starts as '[]' and the loader
 * falls back to the reference seed. The build is always paired with a
 * fresh bake, so production deploys always carry the latest manifests.
 */
function validateAll(raw: unknown[]): LoadedDemoManifest[] {
  const out: LoadedDemoManifest[] = [];
  for (const entry of raw) {
    const result = DemoManifestSchema.safeParse(entry);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('\n');
      const slugHint =
        typeof (entry as { slug?: unknown })?.slug === 'string'
          ? ` (slug '${(entry as { slug: string }).slug}')`
          : '';
      throw new Error(`Demo manifest failed validation${slugHint}:\n${issues}`);
    }
    const slug = result.data.slug;
    if (!slug || slug.length === 0) {
      throw new Error(
        "Baked demo manifest is missing 'slug'. 'scripts/sync-demos.mjs' must inject the folder name."
      );
    }
    out.push({ ...result.data, slug });
  }
  out.sort((a, b) => a.slug.localeCompare(b.slug));
  return out;
}

function asLoaded(m: DemoManifest): LoadedDemoManifest {
  if (!m.slug || m.slug.length === 0) {
    throw new Error("DemoManifest is missing 'slug'.");
  }
  return { ...m, slug: m.slug };
}

const REAL_DEMOS: readonly LoadedDemoManifest[] = validateAll(bakedRaw as unknown[]);
const USING_REFERENCE_SEED = REAL_DEMOS.length === 0;
const ALL_DEMOS: readonly LoadedDemoManifest[] = USING_REFERENCE_SEED
  ? [asLoaded(REFERENCE_DEMO_MANIFEST)]
  : REAL_DEMOS;

export function getAllDemos(): readonly LoadedDemoManifest[] {
  return ALL_DEMOS;
}

export function isUsingReferenceSeed(): boolean {
  return USING_REFERENCE_SEED;
}

export function getDemoBySlug(slug: string): LoadedDemoManifest | undefined {
  return ALL_DEMOS.find((demo) => demo.slug === slug);
}

export function getDemosByCategory(category: string): readonly LoadedDemoManifest[] {
  return ALL_DEMOS.filter((demo) => demo.category === category);
}

export function getDemoCategories(): readonly string[] {
  if (USING_REFERENCE_SEED) return REFERENCE_CATEGORIES.filter((category) => category !== 'all');
  return Array.from(new Set(ALL_DEMOS.map((demo) => demo.category))).sort();
}

export function getLandingPreviewCards(): readonly ReferencePreviewCard[] {
  if (USING_REFERENCE_SEED) return REFERENCE_LANDING_CARDS;
  return ALL_DEMOS.slice(0, 3).map((demo) => ({
    title: demo.title,
    body: demo.description,
    slug: demo.slug,
    cta: '▶ play',
  }));
}

export function getCorkboardCards(): readonly ReferenceCorkboardCard[] {
  if (USING_REFERENCE_SEED) return REFERENCE_CORKBOARD_CARDS;
  return ALL_DEMOS.map((demo) => ({
    category: demo.category,
    title: demo.title,
    stat: demo.card_stat ?? '▶ try',
    slug: demo.slug,
    description: demo.description,
  }));
}

export function getPinnedCount(): number {
  return USING_REFERENCE_SEED ? REFERENCE_PINNED_COUNT : ALL_DEMOS.length;
}
