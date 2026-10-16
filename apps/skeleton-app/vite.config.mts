/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const pkg = JSON.parse(
  readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), 'package.json'),
    'utf-8',
  ),
) as { version: string };

// CI passes the real release version via APP_VERSION (see .github/workflows/_build.yml).
// Falls back to the local package.json version for dev builds.
const appVersion = process.env.APP_VERSION || pkg.version;

export default defineConfig(() => ({
  root: __dirname,
  // VITE_CACHE_DIR: a second dev server of the same checkout (the isolated e2e stack) keeps its
  // dependency pre-bundles apart — sharing them makes each re-optimisation reload the other's pages.
  cacheDir: process.env.VITE_CACHE_DIR || '../../node_modules/.vite/apps/skeleton-app',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    {
      name: 'html-app-version',
      transformIndexHtml(html) {
        return html.replace(/__APP_VERSION__/g, appVersion);
      },
    },
    react(),
    nxViteTsPaths(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['cmdk', 'react', 'react-dom'],
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
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
