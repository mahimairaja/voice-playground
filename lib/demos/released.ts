/**
 * Pure helpers for demo release dates. No 'server-only' so the listing cards
 * (server components) and the unit tests both import them freely.
 *
 * A release date is the cookbook's `released` field, a calendar date string
 * `YYYY-MM-DD`. We compare at day granularity in UTC so a demo's recency does
 * not flicker with the server's timezone or DST.
 */

const NEW_WINDOW_DAYS = 14;
const MS_PER_DAY = 86_400_000;

function parseReleased(value: string | undefined): number | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const utc = Date.UTC(year, month - 1, day);
  // Reject overflow like 2026-02-31 (Date.UTC would roll it into March).
  const back = new Date(utc);
  if (
    back.getUTCFullYear() !== year ||
    back.getUTCMonth() !== month - 1 ||
    back.getUTCDate() !== day
  ) {
    return null;
  }
  return utc;
}

/**
 * True when `released` parses and falls within `days` days before `now`
 * (today through `days` ago, inclusive). Missing, malformed, or future dates
 * are not "recent".
 */
export function isRecentlyReleased(
  released: string | undefined,
  now: Date,
  days: number = NEW_WINDOW_DAYS
): boolean {
  const releasedUtc = parseReleased(released);
  if (releasedUtc === null) return false;
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = (todayUtc - releasedUtc) / MS_PER_DAY;
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Comparator for newest-first ordering. Later `released` dates come first;
 * a missing or malformed date sorts last; slug breaks ties ascending so the
 * order is stable.
 */
export function compareByReleasedDesc(
  a: { released?: string; slug: string },
  b: { released?: string; slug: string }
): number {
  const ra = parseReleased(a.released);
  const rb = parseReleased(b.released);
  if (ra !== rb) {
    if (ra === null) return 1;
    if (rb === null) return -1;
    return rb - ra;
  }
  return a.slug.localeCompare(b.slug);
}
