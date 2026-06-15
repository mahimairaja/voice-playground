import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Vitest setup for pure module and component tests. jsdom environment so
 * 'lib/credentials/store' can access 'window.localStorage'. JSX is supported
 * via the oxc block below (automatic React runtime). The include glob covers
 * both 'lib/**' and 'components/**' test files; no RTL or Playwright in CI.
 */
export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts', 'components/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
  },
  // tsconfig.json sets "jsx": "preserve"; Vite 8's OXC transformer requires an
  // explicit JSX runtime to compile .tsx files pulled into the test import
  // graph (e.g. components/demos/_vocabulary/index.tsx). Without this the
  // rolldown parser sees raw JSX and throws a parse error.
  oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      // 'server-only' is a Next.js runtime guard; in Vitest it's irrelevant
      // and importing it throws. Alias to an empty module so the modules
      // that import it (lib/demos, lib/cookbook) can be exercised in tests.
      'server-only': resolve(__dirname, './test-stubs/server-only.ts'),
    },
  },
});
