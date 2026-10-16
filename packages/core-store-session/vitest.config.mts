import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  // The specs are .tsx; vitest does not read the package tsconfig's `jsx` setting
  esbuild: { jsx: 'automatic' as const },
  cacheDir: '../../node_modules/.vite/packages/core-store-session',
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
    name: '@skeleton/core-store-session',
    watch: false,
    globals: true,
    // Route guards rendered through @testing-library/react need a DOM.
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
