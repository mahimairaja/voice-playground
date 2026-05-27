import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Minimal Vitest setup for F1.1. Pure module tests only: jsdom environment so
 * 'lib/credentials/store' can access 'window.localStorage', but no JSX and no
 * setup files. The credentials store and validator are the only units covered
 * in F1.1; F1.3 may revisit with component / RTL coverage when the agent-mount
 * registry needs it.
 */
export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'jsdom',
    globals: true,
  },
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
