# Skeleton

A SaaS frontend skeleton: an Nx monorepo with a multi-workspace customer web app and a back office, ready to be forked as the frontend of a new product.

Out of the box it provides:

- **Customer app** (`apps/skeleton-app`, port 4200) — OAuth2 login/signup, workspaces scoped under `/w/:organizationId`, dashboard, AI assistant (streamed chat), account settings (profile, login & MFA, preferences), and workspace settings: teams, security (SSO/MFA), service accounts, billing.
- **Back office** (`apps/skeleton-bo-app`, port 4400) — dashboard, workspaces (profile, members, subscriptions, quotas, quota transactions), users, payment product groups.
- Generic **quotas and paywall**, backend-driven **feature flags**, background **job alerts**, **i18n** (English and French).

## Stack

- React 19 + TypeScript (strict), React Router v7
- Vite 7, Tailwind CSS v4, Radix UI / shadcn/ui
- TanStack Query v5 (server state), Zustand v5 (client state)
- Zod 4, react-hook-form, react-intl
- Vitest, ESLint
- Nx 22, pnpm

## Requirements

- **Node.js** >= 20
- **pnpm** >= 9

```sh
npm install -g pnpm
```

## Getting started

1. Install dependencies:

```sh
pnpm install
```

2. Configure environment variables for each app you run:

```sh
cp apps/skeleton-app/.env.example apps/skeleton-app/.env
cp apps/skeleton-bo-app/.env.example apps/skeleton-bo-app/.env
```

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL (API and OAuth2 server), e.g. `http://localhost:8080` |
| `VITE_OAUTH_CLIENT_ID` | OAuth2 public client id — one per app (`oidc-client-public`, `oidc-client-backoffice`) |
| `VITE_AUTH_COOKIE_NAME` | Cookie holding the tokens (`skeleton-auth-store`, `skeleton-auth-store-bo`) |
| `VITE_STATIC_ASSETS_URL` | Static assets base (`/static`, served from each app's `public/static`) |
| `VITE_PUBLIC_POSTHOG_KEY` / `VITE_PUBLIC_POSTHOG_HOST` | PostHog analytics (optional; empty key disables it) |
| `VITE_SALES_URL` | "Talk to sales" link (paywall, enterprise features) |
| `VITE_SUPPORT_EMAIL` | Support contact |
| `VITE_DOCUMENTATION_URL` | Documentation link |
| `VITE_PAYWALL_PRODUCT_GROUP_ID` | Product group whose plans the paywall offers |
| `VITE_ALLOW_INSECURE_URLS` | Dev server only: accept `http://` where `https://` is required (e.g. a local SSO provider) |

3. Start the apps (with the backend running):

```sh
npx nx dev @skeleton/skeleton-app      # http://localhost:4200
npx nx dev @skeleton/skeleton-bo-app   # http://localhost:4400
```

## Commands

```sh
npx nx build @skeleton/skeleton-app        # Production build (same for @skeleton/skeleton-bo-app)
npx nx preview @skeleton/skeleton-app      # Preview the production build
npx nx test <project>                      # Vitest (add --coverage for coverage)
npx nx lint <project>                      # ESLint
npx nx typecheck <project>                 # TypeScript
npx nx run-many -t lint,test,typecheck     # Everything CI checks
node scripts/check-translations.mjs        # Translation keys and locale parity
npx nx sync                                # Refresh Tailwind @source directives
npx nx graph                               # Project dependency graph
```

CI (`.github/workflows/ci.yml` → `_checks.yml`) runs lint, test and typecheck on every pull request.

## Structure

```
apps/
  skeleton-app/        customer web app
  skeleton-bo-app/     back office
packages/
  core-*               backend-agnostic logic: API client & models, config, stores, translations, utils, workspace
  web-*                UI building blocks: components, layout, themes, form, collection, funnel, ai
  web-feature-*        features exporting a *Routes component: login, dashboard, ai, users, organizations, payment
tools/
  tailwind-sync-plugin keeps each app's Tailwind @source list in sync with packages/
scripts/
  check-translations.mjs
docs/
```

## Conventions

The conventions (routing, page/folder naming, columns hooks, API models and requests, translations) are documented in:

- [`CLAUDE.md`](CLAUDE.md) — architecture overview and commands
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
- [`.claude/rules/`](.claude/rules) and [`.claude/skills/`](.claude/skills) — detailed rules and step-by-step guides (create a page, a package, an API model, an API request)

## Internationalization

All user-visible text goes through `useTranslation()` from `@skeleton/core-translations`:

```tsx
const { t } = useTranslation();
return <Button>{t('common.save')}</Button>;
```

- Catalogs live in `packages/core-translations/src/lib/translations/<locale>/<namespace>.json` (`en`, `fr`), with flat keys prefixed by their namespace. Files are merged automatically: adding a namespace means adding one file per locale.
- Every key must exist in both locales; reuse `common.*` for generic labels.
- Zod validation messages are `validation.*` keys, translated by `FieldError`.
- The locale is the stored choice (`skeleton-locale`), else the browser language, else `en`; once logged in, the user's saved language preference wins.
- `node scripts/check-translations.mjs` fails on unknown keys or locale mismatches.

## Forking: renaming the `skeleton` scope

When starting a product from this skeleton, search and replace these identifiers across the repository (excluding `node_modules`, `dist`, `pnpm-lock.yaml` — reinstall afterwards):

| Identifier | Where |
|------------|-------|
| `@skeleton/` (package scope) | every `package.json`, `tsconfig.base.json` paths, imports, `nx` commands, docs |
| `@skeleton/source` | root `package.json` name |
| `skeleton-app`, `skeleton-bo-app` | `apps/` folder names, project names, docs |
| `skeletonApi` / `SkeletonApi` | `packages/core-api/src/lib/api.ts` and every query hook |
| `X-Skeleton-OrganizationId` | request header (`core-api` api-client) — must match the backend |
| `skeleton-auth-store`, `skeleton-auth-store-bo` | auth cookie names (`.env*`, `core-store-oauth`) |
| `skeleton-job-store` | background jobs storage key (`web-layout`) |
| `skeleton-locale` | locale storage key (`core-translations`) |
| `Skeleton` | page titles, `index.html`, manifest, logos in `apps/*/public` |

Then run `pnpm install`, `npx nx reset`, `npx nx sync` and `npx nx run-many -t lint,test,typecheck`.

## Backend contract

The frontend expects a backend that provides the following.

### Authentication

- OAuth2 **authorization code + PKCE** at `{VITE_API_URL}/oauth2/authorize` and `{VITE_API_URL}/oauth2/token` (scopes `openid offline_access`, refresh tokens supported).
- Redirect URI: `{app origin}/login/callback`. One public client per app (`VITE_OAUTH_CLIENT_ID`: e.g. `oidc-client-public` for the customer app, `oidc-client-backoffice` for the back office).
- The access token is a JWT whose `sub` claim is the user id; the session loads the user with `GET /api/v1/users/{sub}`. Requests carry `Authorization: Bearer <token>`; a `401` triggers one refresh-and-retry.

### Conventions

- **JSON in snake_case**: request bodies and query params are converted from camelCase, responses back to camelCase (`axios-case-converter`).
- **Sparse fieldsets**: `?fields=` selects (nested) fields to return; the frontend always asks for what it renders.
- **Pagination**: collections take `offset` and `limit` query params and return the array body plus the `X-Total-Count`, `X-Limit` and `X-Offset` headers (exposed via CORS).
- **Workspace context**: the current workspace id is sent in the `X-Skeleton-OrganizationId` header.
- **Errors** are JSON bodies of the form:

```json
{
  "status_code": 400,
  "error_code": 1234,
  "error": "Human-readable message",
  "parameters_errors": {
    "email": ["Email already used"]
  }
}
```

  `error` (or `message`) becomes the displayed message, `error_code` (or `code`) is an application code, and `parameters_errors` maps field names to messages that `handleApiError` puts on the matching form fields.

### Endpoint families

All under `/api/v1`:

| Base path | Used for |
|-----------|----------|
| `/users`, `/users/{id}` | users; `/organizations`, `/change-email-request`, `/change-password-request`, `/mfa` (`/totp`, `/totp/activate`, `/disable`, `/recovery-codes`, `/reset`) |
| `/organizations`, `/organizations/{id}` | workspaces; `/cancel-deletion`, `/mfa-requirement`, `/sso-availability` |
| `/organizations/{id}/members` | members, `/{memberId}/suspension` |
| `/organizations/{id}/service-accounts` | service accounts, `/permission-catalog`, `/{id}/enable`, `/disable`, `/rotate-secret` |
| `/organizations/{id}/sso-connection` | SSO connection, `/certificates`, `/enablement`, `/enforcement`, `/metadata-import`, `/test` |
| `/organizations/{id}/sso-domains` | SSO verified domains, `/{domainId}/verification` |
| `/organizations/{id}/ai-conversations` | AI conversations; `/{id}/messages` (GET newest-first, POST streams Anthropic-format SSE events) |
| `/admin/organizations/{id}/quota-credits` | back office quota adjustments |
| `/quotas`, `/quota-transactions` | quotas and their transactions |
| `/product-groups`, `/products`, `/prices` | catalog (back office); `/product-groups/{id}/reposition-products`; public `/public/product-groups/{id}` |
| `/subscriptions`, `/subscriptions/checkout-session` | subscriptions and checkout |
| `/customers` | billing customers |
| `/customer-portal/sessions` | billing portal sessions (`/payment-method-update`, `/subscription-update`, `/subscription-cancel`) |
| `/jobs` | background jobs (polled by the job alerts widget) |
| `/app-configuration` | feature flags (`features_configurations`) |

The exact calls are in `packages/core-api/src/lib/endpoints/*.ts`.
