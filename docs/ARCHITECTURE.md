# Architecture

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **React Router v7** for routing
- **Vite 7** for building and dev server
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- **TanStack Query v5** for server state management
- **Zustand v5** for client state management
- **Zod 4** for schemas and validation
- **react-intl** for internationalization
- **Radix UI** primitives for accessible components
- **Nx 22** for monorepo orchestration
- **pnpm** for package management

## Project Structure

The monorepo is organized into three main directories:

- **`apps/`** - Application entry points
  - `skeleton-app/` - Customer web app (port 4200), workspace-scoped under `/w/:organizationId`
  - `skeleton-bo-app/` - Back-office application (port 4400)
- **`packages/`** - Shared libraries organized by domain
- **`tools/`** - Custom Nx plugins and build tools (`tailwind-sync-plugin`)

## Package Organization

Packages follow a naming convention:

### Core Packages (`core-*`)

Backend-agnostic business logic:

| Package | Description |
|---------|-------------|
| `core-api` | API client (`skeletonApi`), endpoint classes and TanStack Query hooks |
| `core-api-models` | Shared TypeScript types and Zod schemas |
| `core-config` | App configuration and feature flags (`useConfig().isFeatureEnabled`) |
| `core-store-oauth` | OAuth state management with Zustand |
| `core-store-session` | Session management and protected routes |
| `core-store-workspace` | Current workspace id store |
| `core-translations` | i18n: provider, `useTranslation`, `useSyncLanguage`, JSON catalogs |
| `core-utils` | Shared utility functions |
| `core-workspace` | `WorkspaceProvider` and current-workspace hooks |

### Web Packages (`web-*`)

Frontend UI components:

| Package | Description |
|---------|-------------|
| `web-components` | Reusable UI components (Radix UI + shadcn/ui) |
| `web-layout` | Application layout, navigation, breadcrumb, job alerts |
| `web-themes` | Tailwind theme configuration |
| `web-form` | Form components and utilities |
| `web-collection` | Data tables and collections |
| `web-funnel` | Multi-step funnel (stepper) layout |
| `web-ai` | AI chat rendering (streamed messages) |

### Feature Packages (`web-feature-*`)

Self-contained feature modules with routes, pages, and components:

| Package | Description |
|---------|-------------|
| `web-feature-login` | Authentication flows (login, OAuth callback, signup, logout) |
| `web-feature-dashboard` | Workspace and back-office dashboards |
| `web-feature-ai` | AI assistant (conversation list and chat) |
| `web-feature-users` | Account settings and back-office user administration |
| `web-feature-organizations` | Workspaces, teams, security (SSO/MFA), service accounts, back-office organizations |
| `web-feature-payment` | Billing, paywall, plans, back-office product groups |

Each feature package exports a `*Routes` component (e.g., `LoginRoutes`, `AccountRoutes`, `AdminUsersRoutes`) that defines its routing structure.

## Routing

The app uses a hierarchical routing system:

### 1. Root Routes

Located in `apps/skeleton-app/src/app/routes/root-routes.tsx`:

- `/login/*`, `/signup`, `/logout/*` - Public routes
- `/*` - Protected application routes

### 2. Protected Routes

Require authentication:

- `ProtectedPage` component checks OAuth token
- Redirects to `/login` if not authenticated
- Every authenticated route lives under `/w/:organizationId`, wrapped in a `WorkspaceProvider`
- `workspace-routes.tsx` mounts `dashboard/*`, `assistant/*`, `account/*`, `workspaces/*` inside the `UserLayout` shell
- `workspace-settings-routes.tsx` mounts `settings/teams`, `settings/security`, `settings/service-accounts`, `settings/billing/*`, `settings/account/*`

The back office (`apps/skeleton-bo-app`) has no workspace prefix: it mounts `Admin*Routes` at `dashboard/*`, `workspaces/*`, `users/*`, `payment/product-groups/*`.

### 3. Feature Routes

Each feature package exports its own routes component that handles internal routing using React Router's nested `<Routes>` and `<Route>` components.

## State Management

### Client State (Zustand)

Used for global application state:

- OAuth tokens (`core-store-oauth`)
- Session data (`core-store-session`)
- Current workspace (`core-store-workspace`)
- Background jobs (`web-layout`)
- Cookie-based persistence for cross-tab synchronization

### Server State (TanStack Query)

Used for API data:

- Custom hooks in `core-api/lib/queries/*`
- Default `staleTime: Infinity`
- Automatic cache invalidation on mutations

## Authentication Flow

1. User accesses protected route
2. `ProtectedPage` checks for OAuth `accessToken` from `useOAuthStore`
3. If missing:
   - Stores target URL in localStorage
   - Redirects to `/login`
4. Login runs the OAuth2 authorization code + PKCE flow (`/oauth2/authorize`, `/oauth2/token`, redirect `/login/callback`)
5. After successful login:
   - Tokens stored in `core-store-oauth` (cookie `skeleton-auth-store`, or `skeleton-auth-store-bo` for the back office)
   - The connected user is loaded from `GET /api/v1/users/{sub}`
   - Redirects to stored target URL or home

## API Client

Singleton `skeletonApi` instance from `core-api`:

- Base URL from `VITE_API_URL` environment variable
- camelCase ↔ snake_case conversion of bodies and params
- Current workspace sent in the `X-Skeleton-OrganizationId` header
- Sparse fieldsets (`?fields=`) and offset/limit pagination (`X-Total-Count`, `X-Limit`, `X-Offset` headers)
- Endpoint classes encapsulate API calls (e.g., `UsersEndpoint`, `OrganizationsEndpoint`, `ServiceAccountsEndpoint`, `AiConversationsEndpoint`)
- Custom hooks wrap calls with TanStack Query (e.g., `useGetUsers`, `useGetUserById`, `useGetServiceAccounts`)

See the "Backend contract" section of the [README](../README.md) for what the backend must provide.

### API Models Pattern

Models in `core-api-models` follow a consistent pattern with Zod schemas:

```typescript
// Read reference (minimal fields for references)
export const readUserRefSchema = z.object({
  id: z.uuid().nullable(),
  email: z.string().nullable(),
});

// Full read schema
export const readUserSchema = z.object({
  id: z.uuid().nullable(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  // ... more fields
});

// Create schema (required fields, messages are translation keys)
export const createUserSchema = z.object({
  email: z.email('validation.common.invalidEmail'),
  firstName: z.string().min(1, 'validation.common.nameRequired'),
});

// Update schema (optional fields)
export const updateUserSchema = z.object({
  email: z.string().optional(),
  firstName: z.string().optional(),
});

// Inferred types
export type User = z.infer<typeof readUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
```

The full conventions are in the `api-model-guide` skill (`.claude/skills/api-model-guide/SKILL.md`).

## Feature Flags, Quotas and Paywall

- **Feature flags** come from `GET /api/v1/app-configuration`; read them with `useConfig().isFeatureEnabled('aiAssistant')` (`core-config`). Flags are declared in `core-api-models/src/lib/app-configuration/models.ts`.
- **Quotas** are generic: the UI reads `organization.activeQuotas` (feature `featureKey` / `displayName`), so a new quota needs no frontend change.
- **Paywall**: `const { openPaywall } = useOpenPaywall()` from `web-feature-payment`, then `openPaywall('quota_exceeded', { quota: '<featureKey>' })`, `openPaywall('role')` or `openPaywall('sso')`.

## AI Assistant

- `core-api` `AiConversationsEndpoint` → `/api/v1/organizations/{orgId}/ai-conversations` and `/{id}/messages` (GET lists messages newest-first; POST streams Anthropic-format SSE events).
- `web-ai` renders the stream (content blocks, input plugins); `web-feature-ai` provides the Assistant pages (`/w/:organizationId/assistant`).

## Internationalization

- `@skeleton/core-translations` wraps react-intl. `useTranslation()` returns `{ t, tNode, tIfKey, isKeyExist }`.
- Catalogs: `packages/core-translations/src/lib/translations/<locale>/<namespace>.json` (`en`, `fr`), flat keys prefixed by namespace, merged with `import.meta.glob`.
- Locale: stored choice (`skeleton-locale`) → browser language → `en`; once logged in, `useSyncLanguage(connectedUser.localizationPreferences.language)` applies the user's preference.
- Zod messages are `validation.*` keys translated by `FieldError` via `tIfKey`.
- Without a provider (unit tests) `useTranslation` falls back to English.
- `node scripts/check-translations.mjs` validates used keys and locale parity.

## Tailwind Integration

The custom `@skeleton/tailwind-sync-plugin` automatically updates `@source` directives in `apps/skeleton-app/src/styles.css` (and the back office's) to ensure Tailwind scans all packages for utility classes.

Run `npx nx sync` to update the configuration after adding new packages.
