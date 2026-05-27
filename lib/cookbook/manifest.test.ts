import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const validPayload = {
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

function mockFetchOnce(response: Partial<Response> & { json?: () => Promise<unknown> }): void {
  globalThis.fetch = vi.fn().mockResolvedValueOnce(response as Response);
}

function mockFetchReject(error: Error): void {
  globalThis.fetch = vi.fn().mockRejectedValueOnce(error);
}

describe('lib/cookbook/manifest', () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch;
    vi.resetModules();
  });

  afterEach(() => {
    if (originalFetch) globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('parses the canonical catalog shape and injects slug', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => validPayload,
    });
    const { fetchCatalog } = await import('./manifest');
    const entries = await fetchCatalog();
    expect(entries).toHaveLength(1);
    expect(entries[0].slug).toBe('drive-thru-coffee');
    expect(entries[0].title).toBe('Drive-thru coffee');
  });

  it('throws CatalogFetchError("network") when fetch rejects', async () => {
    mockFetchReject(new Error('ECONNREFUSED'));
    const { fetchCatalog, CatalogFetchError } = await import('./manifest');
    try {
      await fetchCatalog();
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(CatalogFetchError);
      const cfe = err as InstanceType<typeof CatalogFetchError>;
      expect(cfe.cause).toBe('network');
    }
  });

  it('throws CatalogFetchError("http") on a non-2xx response', async () => {
    mockFetchOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
    const { fetchCatalog, CatalogFetchError } = await import('./manifest');
    try {
      await fetchCatalog();
      throw new Error('should have thrown');
    } catch (err) {
      const cfe = err as InstanceType<typeof CatalogFetchError>;
      expect(cfe).toBeInstanceOf(CatalogFetchError);
      expect(cfe.cause).toBe('http');
    }
  });

  it('throws CatalogFetchError("parse") when response is not JSON', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    const { fetchCatalog, CatalogFetchError } = await import('./manifest');
    try {
      await fetchCatalog();
      throw new Error('should have thrown');
    } catch (err) {
      const cfe = err as InstanceType<typeof CatalogFetchError>;
      expect(cfe).toBeInstanceOf(CatalogFetchError);
      expect(cfe.cause).toBe('parse');
    }
  });

  it('throws CatalogFetchError("parse") when an entry fails schema', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({
        bad: { ...validPayload['drive-thru-coffee'], category: 'Not A Real Category' },
      }),
    });
    const { fetchCatalog, CatalogFetchError } = await import('./manifest');
    try {
      await fetchCatalog();
      throw new Error('should have thrown');
    } catch (err) {
      const cfe = err as InstanceType<typeof CatalogFetchError>;
      expect(cfe).toBeInstanceOf(CatalogFetchError);
      expect(cfe.cause).toBe('parse');
    }
  });
});
