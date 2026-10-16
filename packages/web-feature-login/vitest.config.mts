import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  // The specs are .tsx; vitest does not read the package tsconfig's `jsx` setting
  esbuild: { jsx: 'automatic' as const },
  cacheDir: '../../node_modules/.vite/packages/web-feature-login',
  resolve: {
    // Workspace packages are wired through tsconfig `paths` / `baseUrl`, which vitest does
    // not read — mirror the relevant entries of tsconfig.base.json here.
    alias: [
      {
        find: /^@skeleton\/([^/]+)$/,
        replacement: resolve(__dirname, '../$1/src/index.ts'),
      },
      {
        find: /^packages\/([^/]+)$/,
        replacement: resolve(__dirname, '../$1/src/index.ts'),
      },
    ],
  },
  test: {
    name: '@skeleton/web-feature-login',
    watch: false,
    globals: true,
    // Page components rendered through @testing-library/react need a DOM.
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
