/// <reference types='vitest' />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/web-components',
  plugins: [],
  // No tsconfig.spec.json here: tell esbuild the JSX runtime a component spec needs.
  esbuild: { jsx: 'automatic' },
  resolve: {
    // Workspace packages are wired through tsconfig `paths`, which vitest does
    // not read — mirror the entry of tsconfig.base.json here so a component
    // spec can import a sibling that pulls in @skeleton/core-utils.
    alias: [
      {
        find: /^@skeleton\/([^/]+)$/,
        replacement: resolve(import.meta.dirname, '../$1/src/index.ts'),
      },
    ],
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  test: {
    name: '@skeleton/web-components',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
