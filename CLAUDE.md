# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Skeleton is an Nx-based React monorepo with Vite, TypeScript, and Tailwind CSS: a reusable SaaS frontend (multi-workspace customer app + back office) meant to be forked as the starting point of a product. The workspace uses pnpm for package management.

## Commands

### Development

```bash
npx nx dev @skeleton/skeleton-app        # Start the customer app on port 4200
npx nx dev @skeleton/skeleton-bo-app     # Start the back office on port 4400
npx nx serve @skeleton/skeleton-app      # Alternative dev server command
```

### Build & Preview

```bash
npx nx build @skeleton/skeleton-app      # Production build
npx nx preview @skeleton/skeleton-app    # Preview production build (port 4300; BO: 4500)
```

### Storybook

`apps/storybook` (`@skeleton/storybook`) is the UI catalogue: tokens, components and every screen on a
mock API (MSW). Stories are colocated (`*.stories.tsx` next to the component) and import fixtures,
mocks and helpers from `@skeleton/storybook-support` (`packages/storybook-support`). Conventions:
`apps/storybook/README.md`.

```bash
npx nx storybook @skeleton/storybook         # Dev server on port 6006
npx nx build-storybook @skeleton/storybook   # Static build (apps/storybook/dist)
npx nx typecheck @skeleton/storybook         # Typechecks every story
node apps/storybook/scripts/smoke.mjs        # Renders every story headlessly (needs the dev server)
```

### Testing

```bash
npx nx test @skeleton/skeleton-app       # Run tests with Vitest
npx nx test @skeleton/skeleton-app --coverage  # Run tests with coverage
npx nx test <package-name>       # Run tests for specific package
```

### Code Quality

```bash
npx nx lint @skeleton/skeleton-app       # Run ESLint
npx nx typecheck @skeleton/skeleton-app  # Run TypeScript type checking
npx nx typecheck <package-name>  # Type check specific package
npx nx run-many -t lint,test,typecheck   # What CI runs (.github/workflows/_checks.yml)
node scripts/check-translations.mjs      # Check translation keys and locale parity
```

### Workspace Management

```bash
npx nx show projects                    # List all projects
npx nx show project @skeleton/skeleton-app      # Show specific project configuration
npx nx graph                            # Visualize project dependencies
npx nx sync                             # Sync workspace configuration
```

## Architecture

### Workspace Structure

The monorepo is organized into three main directories:

- **`apps/`** - Application entry points
  - `skeleton-app/` - Customer web app (port 4200), workspace-scoped under `/w/:organizationId`
  - `skeleton-bo-app/` - Back office (port 4400), fixed top-level routes
  - `storybook/` - UI catalogue (port 6006): tokens, components and every screen on an MSW mock API
- **`packages/`** - Shared libraries organized by domain and purpose
- **`tools/`** - Custom Nx plugins and build tools (`tailwind-sync-plugin`)

### Package Organization

Packages follow a naming convention that indicates their purpose:

#### Core Packages (`core-*`)

Backend-agnostic business logic and state management:

- `core-api` - API client (`skeletonApi`), endpoint classes and TanStack Query hooks
- `core-api-models` - Shared Zod schemas and inferred TypeScript types
- `core-config` - App configuration provider; `useConfig().isFeatureEnabled('<flag>')` reads backend feature flags from `GET /api/v1/app-configuration` (flags are declared in `core-api-models/src/lib/app-configuration/models.ts`)
- `core-store-oauth` - OAuth state management using Zustand with cookie persistence
- `core-store-session` - Session management, user context, and protected route components
- `core-store-workspace` - Zustand store holding the current workspace id (sent as the `X-Skeleton-OrganizationId` header)
- `core-translations` - i18n (react-intl): `TranslationProvider`, `useTranslation()`, `useSyncLanguage()` and the JSON catalogs (see "Internationalization")
- `core-utils` - Shared utility functions
- `core-workspace` - `WorkspaceProvider`, current-workspace hooks (`useGetCurrentWorkspaceId`, `useCurrentWorkspaceUrlPrefix`) and subscription-plan helpers

#### Web Packages (`web-*`)

Frontend-specific UI components and features:

- `web-components` - Reusable UI components (built with Radix UI and shadcn/ui patterns)
- `web-layout` - Application layout components (shell, sidebar, navigation, breadcrumb, background job alerts)
- `web-themes` - Tailwind theme configuration and CSS variables
- `web-form` - Form components and utilities (react-hook-form + zod, `handleApiError`)
- `web-collection` - Data collection/table components
- `web-funnel` - Multi-step funnel (stepper) layout and routing helpers
- `web-ai` - AI chat UI: renders the streamed assistant messages (content blocks, input plugins)

#### Feature Packages (`web-feature-*`)

Self-contained feature modules with routes, pages, and components:

- `web-feature-login` - Authentication flows (login, OAuth callback, signup, logout, access denied)
- `web-feature-dashboard` - Workspace dashboard (`DashboardRoutes`) and back-office dashboard (`AdminDashboardRoutes`)
- `web-feature-ai` - AI assistant pages (`AiRoutes`: conversation list + conversation detail), built on `web-ai`
- `web-feature-users` - Account settings (`AccountRoutes`) and back-office user administration (`AdminUsersRoutes`)
- `web-feature-organizations` - Workspaces, teams, security (SSO/MFA), service accounts, and back-office organization administration
- `web-feature-payment` - Billing, paywall, plans, and back-office product groups

Each feature package exports a `*Routes` component (e.g., `LoginRoutes`, `AccountRoutes`, `AdminUsersRoutes`) that defines its routing structure.

#### Storybook Support (`storybook-support`)

Story-only code (providers, app shell, MSW handlers and fixtures per domain), imported by `*.stories.tsx` files as `@skeleton/storybook-support` — never by application code. Packages with stories declare `"implicitDependencies": ["!@skeleton/storybook-support"]` to keep the Nx graph acyclic.

### Application Architecture

#### Routing Structure

The app uses a hierarchical routing system:

1. **`apps/skeleton-app/src/app/routes/root-routes.tsx`** - Top-level router that splits between:
   - `/login/*`, `/signup`, `/logout/*` → public routes from `web-feature-login`
   - `/*` → `ProtectedRoutes` (requires authentication)

2. **Protected routes** wrap authenticated pages with:
   - `ProtectedPage` component - Checks for OAuth access token, redirects to `/login` if missing
   - `WorkspaceProvider` - Everything authenticated lives under `/w/:organizationId`
   - `UserLayout` - Provides navigation shell with sidebar and header
   - Feature routes mounted in `workspace-routes.tsx` (`dashboard/*`, `assistant/*`, `account/*`, `workspaces/*`) and `workspace-settings-routes.tsx` (`settings/teams`, `settings/security`, `settings/service-accounts`, `settings/billing/*`, `settings/account/*`)

3. **Back office** (`apps/skeleton-bo-app/src/app/routes/protected-routes.tsx`) mounts `Admin*Routes` at fixed paths: `dashboard/*`, `workspaces/*`, `users/*`, `payment/product-groups/*`.

4. **Feature Routes** - Each `web-feature-*` package exports a `*Routes` component containing its internal routing using React Router's nested `<Routes>` and `<Route>` components.

See the `routes` and `page-components` rules (`.claude/rules/`) for the detailed conventions.

#### State Management

- **Zustand stores** for global state (OAuth tokens, session data, current workspace, background jobs)
- Stores use `persist` middleware with custom cookie storage for cross-tab synchronization
- **TanStack Query** for server state management with `staleTime: Infinity` default
- Query hooks are colocated with API client in `core-api/lib/queries/*`

#### Authentication Flow

1. User accesses protected route → `ProtectedPage` checks `accessToken` from `useOAuthStore`
2. No token → redirects to `/login`, stores target URL in localStorage
3. Login flow → OAuth2 authorization code + PKCE (`/oauth2/authorize`, `/oauth2/token`, redirect `/login/callback`) → tokens stored in `core-store-oauth` (cookie `skeleton-auth-store`, `skeleton-auth-store-bo` for the back office)
4. The connected user is loaded from `GET /api/v1/users/{sub}` (`sub` claim of the JWT access token)
5. After login → redirect to stored target URL or home

#### API Client Pattern

`core-api` exports a singleton `skeletonApi` instance (`packages/core-api/src/lib/api.ts`) with endpoint methods:

- Base URL from `VITE_API_URL` environment variable
- Request/response keys are converted camelCase ↔ snake_case (axios-case-converter)
- The current workspace id is sent in the `X-Skeleton-OrganizationId` header
- Endpoint classes (e.g., `UsersEndpoint`, `ServiceAccountsEndpoint`, `AiConversationsEndpoint`) encapsulate API calls
- Custom hooks wrap API calls with TanStack Query (e.g., `useGetUsers`, `useGetUserById`)

For the full conventions use the `api-request-guide` skill.

#### API Models Pattern (`core-api-models`)

Models are defined in `packages/core-api-models/src/lib/<entity>/models.ts` using Zod schemas. For the full conventions (layered schema pattern, naming rules, examples, and checklist), use the `api-model-guide` skill.

#### Feature Flags, Quotas & Paywall

- **Feature flags**: `useConfig().isFeatureEnabled('aiAssistant')` (`@skeleton/core-config`). Add a flag to `readFeaturesConfigurationsSchema` in `core-api-models/src/lib/app-configuration/models.ts`.
- **Quotas** are generic: driven by `organization.activeQuotas` (each quota carries its feature `featureKey` / `displayName`). Never hardcode a product-specific quota.
- **Paywall**: `const { openPaywall } = useOpenPaywall()` (`@skeleton/web-feature-payment`), then `openPaywall('quota_exceeded', { quota: '<featureKey>' })`, or `openPaywall('role')` / `openPaywall('sso')`.

#### AI Assistant

- `skeletonApi.aiConversations` → `/api/v1/organizations/{orgId}/ai-conversations` (CRUD) and `/{id}/messages` (GET lists messages newest-first; POST streams Anthropic-format SSE events).
- `web-ai` renders the stream; `web-feature-ai` provides the Assistant pages mounted at `/w/:organizationId/assistant`. The `aiAssistant` feature flag is declared for gating it.

### Internationalization

All user-visible text goes through `@skeleton/core-translations` (react-intl):

- `const { t, tNode, tIfKey, isKeyExist } = useTranslation()`; `t('teams.invite.title', { name })` returns a string, `tNode` allows rich text (`<b>`, `<br>`, …), `tIfKey` translates a value only when it is a known key (used for server messages and zod errors).
- Catalogs: `packages/core-translations/src/lib/translations/<locale>/<namespace>.json` — locales `en` and `fr`, flat keys prefixed by their namespace (`common.save`, `teams.invite.title`), auto-merged with `import.meta.glob` (adding a namespace = adding its two files).
- Every key goes in **both** `en` and `fr`. Reuse `common.*` keys for generic labels (Save, Cancel, Delete…).
- Zod validation messages are `validation.*` keys; `FieldError` translates them via `tIfKey`.
- Locale resolution: stored choice (`localStorage` `skeleton-locale`) → browser language → `en`. Apps call `useSyncLanguage(connectedUser.localizationPreferences.language)` so the UI follows the user's saved preference.
- Without a provider (unit tests rendering a component alone) `useTranslation` falls back to English.
- Run `node scripts/check-translations.mjs` to validate that every used key exists and that locales have the same keys.

See the `translations` rule (`.claude/rules/translations.md`).

### Key Configuration Files

- **`nx.json`** - Nx workspace configuration with plugin setup and target defaults
- **`tsconfig.base.json`** - TypeScript path mappings: `@skeleton/*` → `packages/*/src/index.ts`
- **`apps/<app>/.env`** (from `.env.example`) - `VITE_API_URL`, `VITE_OAUTH_CLIENT_ID`, `VITE_AUTH_COOKIE_NAME`, `VITE_STATIC_ASSETS_URL`, `VITE_PUBLIC_POSTHOG_KEY`/`HOST`, `VITE_SALES_URL`, `VITE_SUPPORT_EMAIL`, `VITE_DOCUMENTATION_URL`, `VITE_PAYWALL_PRODUCT_GROUP_ID`, `VITE_ALLOW_INSECURE_URLS`
- **`apps/<app>/src/styles.css`** - Global styles with `@source` directives listing all packages for Tailwind
- **`.github/workflows/ci.yml`** + **`_checks.yml`** - PR checks (lint, test, typecheck via `nx run-many`)

### Technology Stack

- React 19 with TypeScript (strict mode)
- React Router v7 for routing
- Vite 7 for building and dev server
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- TanStack Query v5 for server state
- Zustand v5 for client state
- Zod 4 for schemas and validation
- react-intl for internationalization
- Radix UI primitives for accessible components
- Vitest for testing
- ESLint with TypeScript rules
- Nx 22 for monorepo orchestration

### Tailwind Integration

The custom `@skeleton/tailwind-sync-plugin` automatically updates `@source` directives in `apps/skeleton-app/src/styles.css` (and the back office's) to include all packages. This ensures Tailwind scans all components for utility classes. The plugin runs via `npx nx sync`. Storybook (tagged `type:storybook`) is skipped: its stylesheet scans `packages/` as a whole.

### Creating New Packages

For scaffolding new packages (feature, core, or web), including the Nx generator commands and post-creation wiring, use the `package-creation` skill.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
