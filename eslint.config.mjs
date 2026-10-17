import nx from '@nx/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/build',
      '**/.react-router',
      // Declaration output of the `typecheck` target (`tsc --build --emitDeclarationOnly`).
      // Generated, gitignored, and linting it makes a project's own lint depend on whether its
      // typecheck has run.
      '**/out-tsc',
      // wrangler's build scratch. Gitignored, so CI never sees it — but `wrangler dev` leaves a
      // bundled facade in packages/cf-worker/.wrangler/tmp, and linting that fails the cf-worker
      // project locally for anyone who has run the worker (bin/e2e.sh does).
      '**/.wrangler',
    ],
  },
  // Cypress specs are written in chai's assertion style, where the assertion IS the expression:
  // `expect(calls).to.be.empty`, `.to.be.true`, `.to.not.be.null`. `no-unused-expressions` reads
  // every one of them as a statement with no effect. Rewriting them (`.to.have.length(0)`, …) would
  // trade the library's idiom — and its failure messages — for the linter's convenience.
  {
    files: ['apps/e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      '@tanstack/query': tanstackQueryPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
  // Stories sit next to their component but belong to the Storybook app: they import
  // `@skeleton/storybook-support`, which imports the packages back (app shell, providers). Nx drops that
  // edge from the project graph (`"implicitDependencies": ["!@skeleton/storybook-support"]` in each
  // package), so tasks stay acyclic; the lint rule still sees the file-level loop, so it is off here.
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  // Reuse between the two surfaces is one-directional. A back-office
  // (`*-manager-page`) page may import a workspace page's code when that code is
  // generic — but the reverse is never allowed, because back-office components are
  // built for a cross-workspace context with no workspace prefix in their routes.
  //
  // Only the app -> back-office direction is mechanically checkable, so that is what
  // is enforced here. The other direction stays a review-time judgement: a workspace
  // component that resolves a current workspace (`useCurrentWorkspaceUrlPrefix`,
  // `useGetCurrentWorkspaceId`) is *not* generic and must not be reused by the back
  // office — that is what produced the dead `/w//campaigns/<id>` links.
  //
  // The globs cover a page's root file (`../`) and its `hooks/`, `components/`,
  // `tabs/` subfolders (`../../`); at those depths `..` never escapes `pages/`, so
  // imports of `lib/modals`, … are unaffected. Route files are out of scope — they
  // must be able to mount back-office pages.
  // NB: these are gitignore-style patterns, not minimatch; extglob (`!(a|b)`) does
  // not work here.
  {
    files: ['**/src/lib/pages/**/*.{ts,tsx}'],
    ignores: ['**/src/lib/pages/*-manager-page/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*-manager-page/**', '../../*-manager-page/**'],
              message:
                'Workspace pages must not import from back-office (*-manager-page) pages — that code is built for a cross-workspace context. Move the shared part to pages/shared/ instead.',
            },
          ],
        },
      ],
    },
  },
];
