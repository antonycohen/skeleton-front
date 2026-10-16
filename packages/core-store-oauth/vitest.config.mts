import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/core-store-oauth',
  resolve: {
    // Workspace packages are wired through tsconfig `paths`, which vitest does
    // not read — mirror the relevant entry of tsconfig.base.json here.
    alias: [
      {
        find: /^@skeleton\/([^/]+)$/,
        replacement: resolve(__dirname, '../$1/src/index.ts'),
      },
    ],
  },
  test: {
    name: '@skeleton/core-store-oauth',
    watch: false,
    globals: true,
    // The store persists in document.cookie and the hooks are React hooks, so
    // the specs need a DOM.
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
