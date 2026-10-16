---
name: create-list-page
description: Scaffold a list page (Collection table) in a web-feature-* package. Invoked by create-page once the user has confirmed kind=list, the surface (admin/workspace), the feature, the entity, and the entry point. Do not invoke directly unless the caller has already completed those discovery steps.
argument-hint: [feature] [entity] [admin|workspace]
---

# Create a List Page

Scaffolds a `list-*` page that renders a `Collection` table. Assumes the caller (`create-page`) has already resolved:

- **Surface** — admin (`*ManagerPage`, breadcrumb required) vs workspace.
- **Feature package** and **entity** name.
- **Entry point** — sidebar nav section, user menu, or tab.
- **Prerequisites** — model, endpoint, `useGet<Entities>` query exist (or have been created via `api-model-guide` / `api-request-guide`).
- **Plan** — confirmed with the user.

If any of the above is unclear, stop and run the `create-page` skill first.

Authoritative rules:

- `page-components` → folder/file/component naming, page-local subfolders.
- `list-columns-hooks` → the columns hook.
- `routes` → how the page is mounted.
- `translations` → all text through `t()`, keys in both `en` and `fr`.

## Shared (both levels)

- [ ] Columns hook `hooks/use-<entity>-list-columns.tsx` returning `ColumnDef<Read<Entity>>[]` (follow the `list-columns-hooks` rule); always include an `actions` column. For a **nested** list, the hook can live alongside the tab file (`tabs/<name>-tab/hooks/use-<entity>-list-columns.tsx`).
- [ ] `Collection` wired with `useQueryFn`, `staticParams`, `queryFields`, and an `emptyState`
- [ ] Headers, cell fallbacks, action labels, title/description and `emptyState` texts use `t()` (`common.actions`, `common.delete`, … for generic ones); new keys added to the namespace file in both `en` and `fr`
- [ ] Workspace: `staticParams` carries the workspace id from `useGetCurrentWorkspaceId()`, links built with `useCurrentWorkspaceUrlPrefix()`. Admin: links are absolute from `/`.

## Level A — Top-level list page

File / component:

- [ ] `pages/list-<entity>[-manager]-page/list-<entity>[-manager]-page.tsx`, named export `<Entity>ListPage` (workspace) / `<Entity>ListManagerPage` (admin)
- [ ] Shell: `LayoutTopbar` (admin: with `useBreadcrumb` rooted at `Home`) → `LayoutContent` → `LayoutHeader` (title + description) → `<Collection … />`

Routing (in `routes/<name>-routes.tsx`):

- [ ] Add `<Route path="/" element={<…ListPage />} />` to the feature's `*Routes` component
- [ ] If `routes/<name>-routes.tsx` does not exist yet, create the `*Routes` component (`Admin<Entity>Routes` for admin, `<Feature>Routes` for workspace) and export from `src/index.ts`

## Level B — Nested list (tab in an existing page)

File / component (inside the parent page's `tabs/`):

- [ ] `pages/<parent-page>/tabs/<entity>-list-tab.tsx` (or `tabs/<entity>-list-tab/<entity>-list-tab.tsx` if it needs its own `hooks/` / `components/`), named export `<Entity>ListTab`
- [ ] **No** `LayoutTopbar` / `LayoutContent` / `LayoutHeader` — the parent page already provides the shell. Render the `Collection` (optionally wrapped in a header/description block) directly.
- [ ] If the parent uses the outlet-context shared-data pattern, destructure from `useOutletContext<…OutletContext>()`; otherwise call `useGetCurrentWorkspaceId()` / `useParams()` directly.

Routing (in the parent feature's `routes/<name>-routes.tsx`):

- [ ] Add a new entry to the parent's `getTabItems(...)` (`{ title: '<Entity>', url: '${baseUrl}/<parent>/<segment>' }`)
- [ ] Add the child `<Route path="<segment>" element={<<Entity>ListTab />} />` inside the parent's layout `<Route element={<Parent…Page />}>` block

## Finishing

See `create-page` SKILL.md "Shared finishing steps" — apply the **top-level** or **nested** subset depending on the level you built.
