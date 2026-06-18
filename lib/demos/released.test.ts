import { describe, expect, it } from 'vitest';
import { compareByReleasedDesc, isRecentlyReleased } from './released';

// A fixed "now" so the window math is deterministic.
const NOW = new Date('2026-06-18T12:00:00Z');

describe('isRecentlyReleased', () => {
  it('is true within the default 14-day window, including today', () => {
    expect(isRecentlyReleased('2026-06-15', NOW)).toBe(true); // 3 days ago
    expect(isRecentlyReleased('2026-06-18', NOW)).toBe(true); // today
  });

  it('is true on the 14-day boundary and false just past it', () => {
    expect(isRecentlyReleased('2026-06-04', NOW)).toBe(true); // 14 days ago
    expect(isRecentlyReleased('2026-06-03', NOW)).toBe(false); // 15 days ago
  });

  it('is false for missing, malformed, overflow, or future dates', () => {
    expect(isRecentlyReleased(undefined, NOW)).toBe(false);
    expect(isRecentlyReleased('not-a-date', NOW)).toBe(false);
    expect(isRecentlyReleased('2026-02-31', NOW)).toBe(false); // calendar overflow
    expect(isRecentlyReleased('2026-06-19', NOW)).toBe(false); // future
  });

  it('honors a custom window', () => {
    expect(isRecentlyReleased('2026-06-11', NOW, 3)).toBe(false); // 7 days ago
    expect(isRecentlyReleased('2026-06-16', NOW, 3)).toBe(true); // 2 days ago
  });
});

describe('compareByReleasedDesc', () => {
  const d = (slug: string, released?: string) => ({ slug, released });

  it('orders newest first', () => {
    const sorted = [d('a', '2026-05-12'), d('b', '2026-06-15'), d('c', '2026-05-29')].sort(
      compareByReleasedDesc
    );
    expect(sorted.map((x) => x.slug)).toEqual(['b', 'c', 'a']);
  });

  it('sorts missing or malformed dates last', () => {
    const sorted = [d('z'), d('m', '2026-06-01'), d('a', 'garbage')].sort(compareByReleasedDesc);
    expect(sorted.map((x) => x.slug)).toEqual(['m', 'a', 'z']);
  });

  it('breaks same-date ties by slug ascending', () => {
    const sorted = [d('beta', '2026-05-29'), d('alpha', '2026-05-29')].sort(compareByReleasedDesc);
    expect(sorted.map((x) => x.slug)).toEqual(['alpha', 'beta']);
  });
});
