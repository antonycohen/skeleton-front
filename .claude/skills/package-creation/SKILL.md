---
name: package-creation
description: How to scaffold new packages in the Skeleton Nx monorepo. Use when the user wants to create a new feature, core, web, or shared package, or asks about the Nx generator commands and post-creation wiring.
disable-model-invocation: true
argument-hint: [package-name]
---

# Creating New Packages

Conventions for scaffolding packages in this Nx monorepo. All packages live under `packages/<name>` and are imported via the `@skeleton/<name>` path alias (mapped in `tsconfig.base.json`).

## Package naming

The prefix signals the package's purpose:

- `core-*` — backend-agnostic business logic, state, API client/models (e.g. `core-api`, `core-utils`, `core-translations`).
- `web-*` — frontend UI building blocks (e.g. `web-components`, `web-layout`).
- `web-feature-*` — self-contained feature modules with routes/pages/components. Each exports a `*Routes` component.

Pick the prefix that matches the package's role, then generate it with the matching command below.

## Feature package

```bash
npx nx g @nx/react:lib web-feature-<name> \
    --directory=packages/web-feature-<name> \
    --importPath=@skeleton/web-feature-<name> \
    --bundler=none \
    --unitTestRunner=none \
    --linter=eslint
```

## Core package

```bash
npx nx g @nx/react:lib core-<name> \
    --directory=packages/core-<name> \
    --importPath=@skeleton/core-<name> \
    --bundler=none \
    --unitTestRunner=none \
    --linter=eslint
```

`web-*` (non-feature) packages use the same generator with the `web-<name>` name and matching `--directory`/`--importPath`.

## After creating a package

1. If it contains styled components, add it to the `@source` list in `apps/skeleton-app/src/styles.css` so Tailwind scans it.
2. Run `npx nx sync` to update the Tailwind `@source` configuration (handled by `@skeleton/tailwind-sync-plugin`).
3. Export the package's public API from `packages/<name>/src/index.ts`.
4. For a `web-feature-*` package, export a `<Name>Routes` component and mount it in the app's routing (`apps/skeleton-app/src/app/routes` or `apps/skeleton-bo-app/src/app/routes`).
5. Put the package's UI texts in a new namespace file in `packages/core-translations/src/lib/translations/{en,fr}/<namespace>.json` (see the `translations` rule).

## Checklist

- [ ] Correct prefix for the package's purpose (`core-` / `web-` / `web-feature-`)
- [ ] Generated with `--bundler=none --unitTestRunner=none --linter=eslint`
- [ ] `--importPath=@skeleton/<name>` matches the directory
- [ ] Added to `@source` in `styles.css` if it has styled components
- [ ] `npx nx sync` run
- [ ] Public API exported from `src/index.ts`
- [ ] Feature packages export a `*Routes` component and are mounted in the app router
