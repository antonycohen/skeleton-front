---
paths:
  - "packages/web-feature-*/src/lib/routes/**"
  - "apps/skeleton-app/src/app/routes/**"
  - "apps/skeleton-bo-app/src/app/routes/**"
---

# Routes

How routing is structured across the two apps and inside feature packages. References: `web-feature-organizations` routes, `apps/skeleton-app/src/app/routes`, `apps/skeleton-bo-app/src/app/routes`.

## The two apps

- **`skeleton-app`** — the customer app. Everything authenticated lives **under a workspace prefix** `/w/:organizationId`. `ProtectedRoutes` matches `w/:organizationId?/*`, wraps the tree in `<WorkspaceProvider selectedWorkspaceId={organizationId}>`, and renders `WorkspaceRoutes`. Inside, build links with `useCurrentWorkspaceUrlPrefix()` (returns `/w/<id>`) — **never hardcode `/w/...`**.
- **`skeleton-bo-app`** — the back-office/admin app. Routes are mounted at **fixed top-level paths** (`/dashboard`, `/workspaces`, `/users`, `/payment/product-groups`); there is no workspace prefix. Links are absolute from root (`/`).

## Feature route component (the `*Routes` export)

Each `web-feature-*` package exposes one or more route components in `src/lib/routes/<name>-routes.tsx`:

- Named export, PascalCase ending in `Routes`, returning `<Routes>` with `<Route>` children.
- Import pages by full path (`../pages/<folder>/<file>`); import tab components from the detail page's `tabs` barrel.
- **Naming signals the surface:**
  - `Admin<Entity>Routes` → mounted in the BO app; mounts `*ManagerPage` pages (e.g. `AdminOrganizationsRoutes`, `AdminUsersRoutes`, `AdminProductGroupsRoutes`).
  - `<Feature>Routes` → mounted in the customer app / workspace settings (e.g. `TeamsRoutes`, `ServiceAccountsRoutes`, `AiRoutes`, `AccountRoutes`).

### Common shapes

List + detail-with-tabs:

```tsx
<Routes>
  <Route path="/" element={<OrganizationsListManagerPage />} />
  <Route path=":organizationId" element={<OrganizationEditManagerPage />}>
    <Route index element={<Navigate to="overview" replace />} />
    <Route path="overview" element={<OrganizationOverviewTab />} />
    <Route path="members" element={<OrganizationMembersTab />} />
    {/* …one child Route per tab… */}
  </Route>
</Routes>
```

- Default tab: either an `index` route rendering the first tab, or `<Route index element={<Navigate to="profile" replace />} />`.
- Simple single-page features add a catch-all redirect: `<Route path="*" element={<Navigate to="/" />} />`.
- Sub-routers that need their own prefix segment are mounted with a trailing `/*` (`path="billing/*"`).

## Adding an admin route (BO app)

1. Build the feature route component as `Admin<Entity>Routes` over `*ManagerPage` pages (see the page-components rule for the `manager` naming + breadcrumb requirement).
2. Export it from the feature package's `src/index.ts`.
3. Mount it in `apps/skeleton-bo-app/src/app/routes/protected-routes.tsx` inside the `UserLayout` element route:
   ```tsx
   <Route path="<segment>/*" element={<Admin<Entity>Routes />} />
   ```
4. Add the sidebar entry: either in the BO app's navigation files (`apps/skeleton-bo-app/src/app/navigation/*`) or directly in `mainNavigationGroups` in `protected-routes.tsx`. Titles go through `t()`.

## Adding a workspace route (customer app)

1. Build the feature route component (`<Feature>Routes`) and export it from the package's `src/index.ts`.
2. Mount it under the workspace tree:
   - Main feature area → `apps/skeleton-app/src/app/routes/workspace-routes.tsx`.
   - Workspace settings → `apps/skeleton-app/src/app/routes/workspace-settings-routes.tsx`.
   ```tsx
   <Route path="<segment>/*" element={<FeatureRoutes />} />
   ```
3. Everything here is already under `/w/:organizationId` via `WorkspaceProvider` — read the id with `useGetCurrentWorkspaceId()` and build links with `useCurrentWorkspaceUrlPrefix()`. Do not add another workspace segment.
4. Add navigation via the workspace nav hooks in `apps/skeleton-app/src/app/hooks/` (`useMainNavigation`, `useUserNavigation`, `useWorkspaceSettingsNavigation`). Titles go through `t()`.
