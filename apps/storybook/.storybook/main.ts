import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const appVersion =
  process.env.APP_VERSION ||
  (JSON.parse(readFileSync(resolve(here, '../../skeleton-app/package.json'), 'utf-8')) as { version: string }).version;

// The workspace `paths` of tsconfig.base.json as Vite aliases. Vite's own `resolve.tsconfigPaths`
// only applies them to files a tsconfig includes, and no tsconfig includes the stories or the MDX
// docs. Exact entries come first, so they win over the `@skeleton/*` wildcard.
const workspaceRoot = resolve(here, '../../..');
const tsconfigPaths = (
  JSON.parse(readFileSync(resolve(workspaceRoot, 'tsconfig.base.json'), 'utf-8')) as {
    compilerOptions: { paths: Record<string, string[]> };
  }
).compilerOptions.paths;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const workspaceAliases = Object.entries(tsconfigPaths)
  .sort(([a], [b]) => Number(a.endsWith('/*')) - Number(b.endsWith('/*')))
  .map(([key, [target]]) =>
    key.endsWith('/*')
      ? { find: new RegExp(`^${escape(key.slice(0, -1))}([^/]+)$`), replacement: resolve(workspaceRoot, target.replace('*', '$1')) }
      : { find: new RegExp(`^${escape(key)}$`), replacement: resolve(workspaceRoot, target) },
  );

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
    '../../../packages/*/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes', 'msw-storybook-addon'],
  // The customer app's public folder too: components load its logos and images from the site root.
  staticDirs: ['../public', '../../skeleton-app/public'],
  // Vite loads `.env.storybook` from the app root (see envDir below) when Storybook runs in this mode.
  core: { disableTelemetry: true },
  // react-docgen (Babel) rather than react-docgen-typescript: much faster on a codebase this size.
  typescript: { reactDocgen: 'react-docgen' },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      mode: 'storybook',
      envDir: resolve(here, '..'),
      cacheDir: resolve(here, '../../../node_modules/.vite/apps/storybook'),
      define: { __APP_VERSION__: JSON.stringify(appVersion) },
      // Stories are excluded from their package's tsconfig.lib.json, so the tsconfig the transformer
      // finds for them sets no `jsx`: force the automatic runtime the app uses.
      oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
      plugins: [tailwindcss()],
      resolve: { alias: workspaceAliases, dedupe: ['react', 'react-dom'] },
      optimizeDeps: { include: ['cmdk', 'react', 'react-dom'] },
    });
  },
};

export default config;
