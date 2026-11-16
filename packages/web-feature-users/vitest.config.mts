import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/web-feature-users',
  resolve: {
    // Workspace packages are wired through tsconfig `paths`, which vitest does
    // not read — mirror the relevant entry of tsconfig.base.json here.
    alias: [
      {
        find: /^@skeleton\/([^/]+)$/,
        replacement: resolve(import.meta.dirname, '../$1/src/index.ts'),
      },
    ],
  },
  test: {
    name: '@skeleton/web-feature-users',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
