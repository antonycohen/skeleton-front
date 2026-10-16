---
name: create-detail-page
description: Scaffold a detail page (read view, usually with tabs) in a web-feature-* package. Invoked by create-page once the user has confirmed kind=detail, the surface (admin/workspace), the feature, the entity, the tabs, and the entry point. Do not invoke directly unless the caller has already completed those discovery steps.
argument-hint: [feature] [entity] [admin|workspace]
---

# Create a Detail Page

Scaffolds a `details-*` page (read-only view, usually with tabs). Assumes the caller (`create-page`) has already resolved surface, feature, entity, tab list, entry point, prerequisites, and plan. If anything is unclear, stop and run `create-page` first.

Authoritative rules: `page-components`, `routes`, `translations`.

## Checklist

**Page** (`pages/details-<entity>[-manager]-page/details-<entity>[-manager]-page.tsx`, named export `Details<Entity>Page` / `<Entity>Details<Scope>ManagerPage`):

- [ ] Shell: `LayoutTopbar` (admin: with `useBreadcrumb`) → `LayoutContent` → `LayoutHeader` (title / status) → `TabNavLinks` → `<Outlet />`
- [ ] Define `getTabItems(baseUrl, <entityId>, t)` at module scope returning `{ title, url }[]` (titles via `t('<namespace>.tabs.…')`); urls are absolute and include the entity id segment
- [ ] Resolve `baseUrl`:
  - **Workspace** → `useCurrentWorkspaceUrlPrefix()`
  - **Admin** → urls are absolute from `/`
- [ ] Read the entity id with `useParams<{ <entityId>: string }>()`

**Data loading (shared-data outlet pattern):**

A detail page almost always loads the entity once and passes it to tabs via `Outlet` context — do not refetch in each tab.

- [ ] `types.ts` in the page folder defining `<Entity>OutletContext` (e.g. `{ <entity>: Read<Entity> | undefined; isLoading: boolean }`)
- [ ] `hooks/use-get-<entity>-for-<page>.ts` wrapping the `core-api` get-by-id hook with the exact `fields` projection the tabs need
- [ ] In the page: `<Outlet context={outletContext satisfies <Entity>OutletContext} />`
- [ ] In each tab: `const { <entity>, isLoading } = useOutletContext<<Entity>OutletContext>()`

**Tabs** (one folder or file per tab under `tabs/`):

- [ ] File `tabs/<name>-tab.tsx` (or `tabs/<name>-tab/<name>-tab.tsx` when the tab has its own `hooks/` / `components/`), named export `<Name>Tab`
- [ ] Tab content is read-only (no form); destructure from the outlet context
- [ ] All labels/texts via `t()`; new keys added to both `en` and `fr`
- [ ] Tab-local helpers under `tabs/<name>-tab/hooks/` and `tabs/<name>-tab/components/`

**Routing** (in `routes/<name>-routes.tsx`, see the `routes` rule):

- [ ] Mount the page as a layout route with the tabs as children:
  ```tsx
  <Route path=":<entityId>" element={<Details<Entity>Page />}>
    <Route index element={<Navigate to="<first-tab>" replace />} />
    <Route path="<tab-1>" element={<Tab1 />} />
    {/* …one child Route per tab… */}
  </Route>
  ```
- [ ] Prefer the explicit `<Route index><Navigate to="…" replace /></Route>` default-tab pattern; using the first tab path as `index` is also acceptable — be consistent within the feature

**Mount + entry point + verify** (shared with all kinds — see `create-page` SKILL.md "Shared finishing steps").
