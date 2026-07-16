/**
 * One source of truth for cookbook URLs. The playground reads the catalog
 * from a public GitHub Raw URL at runtime; per-demo source links route to
 * the repository tree view in a new tab.
 *
 * 'NEXT_PUBLIC_COOKBOOK_BASE_URL' lets a fork-the-cookbook deployment swap
 * in a different raw host without redeploying. Untouched in production.
 */

const DEFAULT_RAW_BASE = 'https://raw.githubusercontent.com/mahimairaja/awesome-voice-apps/main';
const REPO_BASE = 'https://github.com/mahimairaja/awesome-voice-apps';

const RAW_BASE = process.env.NEXT_PUBLIC_COOKBOOK_BASE_URL ?? DEFAULT_RAW_BASE;

export const CATALOG_URL = `${RAW_BASE}/catalog.json`;
export const COOKBOOK_BASE_URL = REPO_BASE;

export function demoSourceUrl(slug: string): string {
  return `${REPO_BASE}/tree/main/demos/${slug}`;
}

export function blogRawUrl(slug: string): string {
  return `${RAW_BASE}/demos/${slug}/blog.md`;
}

export function tutorialRawUrl(slug: string): string {
  return `${RAW_BASE}/demos/${slug}/tutorial.md`;
}
