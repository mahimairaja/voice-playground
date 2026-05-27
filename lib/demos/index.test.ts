import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SHIPPED_PAYLOAD = {
  'drive-thru-coffee': {
    title: 'Drive-thru coffee',
    category: 'Drive-thru & Ordering',
    description: 'Takes a coffee order, modifies items mid-flow, totals the cart.',
    who_for: 'Cafes that want voice ordering without ripping out their POS.',
    recording_url: null,
    required_credentials: ['livekit_url'],
    ui_components: ['Order'],
  },
};

let originalFetch: typeof globalThis.fetch | undefined;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  vi.resetModules();
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => SHIPPED_PAYLOAD,
  } as Response);
});

afterEach(() => {
  if (originalFetch) globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('lib/demos/index', () => {
  it('getAllShipped returns the canonical catalog entries', async () => {
    const { getAllShipped } = await import('./index');
    const shipped = await getAllShipped();
    expect(shipped).toHaveLength(1);
    expect(shipped[0].slug).toBe('drive-thru-coffee');
  });

  it('getShippedBySlug returns undefined for unknown slugs', async () => {
    const { getShippedBySlug } = await import('./index');
    const hit = await getShippedBySlug('drive-thru-coffee');
    const miss = await getShippedBySlug('nope');
    expect(hit?.title).toBe('Drive-thru coffee');
    expect(miss).toBeUndefined();
  });

  it('getAllDemos appends planned entries after shipped', async () => {
    vi.doMock('./planned', () => ({
      PLANNED_DEMOS: [
        {
          slug: 'dental-front-desk',
          title: 'Dental front desk',
          category: 'Receptionist & Booking',
          target_date: '2026-09',
          github_link: 'https://example.invalid/issue/1',
          why: 'Books appointments against a calendar.',
        },
      ],
    }));
    const { getAllDemos } = await import('./index');
    const all = await getAllDemos();
    expect(all).toHaveLength(2);
    expect(all[0].status).toBe('shipped');
    expect(all[1].status).toBe('planned');
    expect(all[1].slug).toBe('dental-front-desk');
  });

  it('getDemoCategories returns the union sorted alphabetically', async () => {
    vi.doMock('./planned', () => ({
      PLANNED_DEMOS: [
        {
          slug: 'returns-and-refunds',
          title: 'Returns and refunds',
          category: 'Customer Support',
          target_date: '2026-10',
          github_link: 'https://example.invalid/issue/2',
          why: 'Walks through a return.',
        },
      ],
    }));
    const { getDemoCategories } = await import('./index');
    const cats = await getDemoCategories();
    expect(cats).toEqual(['Customer Support', 'Drive-thru & Ordering']);
  });
});
