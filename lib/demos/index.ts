import fs from 'node:fs';
import path from 'node:path';
import 'server-only';
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
 * Build-time loader for demo manifests.
 *
 * Reads every '<sibling>/awesome-voice-apps/demos/<slug>/playground.json',
 * validates against 'DemoManifestSchema', and exposes typed accessors. The
 * read happens once at module init, so 'pnpm build' fails fast if any
 * manifest is malformed.
 *
 * If the sibling repo is not present (e.g. in a Vercel build that does not
 * fetch awesome-voice-apps), the loader logs a warning and returns no
 * manifests rather than crashing. The deploy task (T31) will arrange for
 * the sibling to be available at build time.
 */
const DEMOS_ROOT = path.resolve(process.cwd(), '..', 'awesome-voice-apps', 'demos');

function loadAllManifests(): DemoManifest[] {
  if (!fs.existsSync(DEMOS_ROOT)) {
    console.warn(
      `[lib/demos] No demo manifests loaded: '${DEMOS_ROOT}' does not exist. ` +
        'Demo pages will be empty until the sibling awesome-voice-apps repo is in place.'
    );
    return [];
  }

  const entries = fs.readdirSync(DEMOS_ROOT, { withFileTypes: true });
  const manifests: DemoManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;

    const manifestPath = path.join(DEMOS_ROOT, entry.name, 'playground.json');
    if (!fs.existsSync(manifestPath)) continue;

    const raw = fs.readFileSync(manifestPath, 'utf-8');

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(
        `Demo manifest at ${manifestPath} is not valid JSON: ${(err as Error).message}`
      );
    }

    const result = DemoManifestSchema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('\n');
      throw new Error(`Demo manifest at ${manifestPath} failed validation:\n${issues}`);
    }

    if (result.data.slug !== entry.name) {
      throw new Error(
        `Demo manifest at ${manifestPath} declares slug '${result.data.slug}' ` +
          `but lives in folder '${entry.name}'. The two must match.`
      );
    }

    manifests.push(result.data);
  }

  manifests.sort((a, b) => a.slug.localeCompare(b.slug));
  return manifests;
}

const REAL_DEMOS: readonly DemoManifest[] = loadAllManifests();
const USING_REFERENCE_SEED = REAL_DEMOS.length === 0;
const ALL_DEMOS: readonly DemoManifest[] = USING_REFERENCE_SEED
  ? [REFERENCE_DEMO_MANIFEST]
  : REAL_DEMOS;

export function getAllDemos(): readonly DemoManifest[] {
  return ALL_DEMOS;
}

export function isUsingReferenceSeed(): boolean {
  return USING_REFERENCE_SEED;
}

export function getDemoBySlug(slug: string): DemoManifest | undefined {
  return ALL_DEMOS.find((demo) => demo.slug === slug);
}

export function getDemosByCategory(category: string): readonly DemoManifest[] {
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
