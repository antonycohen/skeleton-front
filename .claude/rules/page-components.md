---
paths:
  - "packages/web-feature-*/src/lib/pages/**"
  - "packages/web-feature-*/src/lib/routes/**"
---

# Page Components & Folders

Conventions for page components inside `web-feature-*` packages. Reference implementations: `web-feature-organizations`, `web-feature-users`, `web-feature-ai`.

## Location

All pages live under:

```
packages/web-feature-<name>/src/lib/pages/
```

## One folder per page

Each page gets its own folder, and the page component file is named **identically** to the folder:

```
pages/
  <action>-<entity>-page/
    <action>-<entity>-page.tsx     # the page component (required)
```

Examples: `list-ai-conversations-page/list-ai-conversations-page.tsx`, `details-ai-conversation-page/details-ai-conversation-page.tsx`, `list-service-account-page/list-service-account-page.tsx`, `edit-team-page/edit-team-page.tsx`.

The folder name and file name must match. Do not diverge (e.g. avoid a `list-entities-page/` folder containing `entities-list-page.tsx`). A few older back-office pages still diverge (`list-users-manager-page/users-list-manager-page.tsx`); do not copy that.

## Naming

- **Folder / file**: kebab-case `<action>-<entity>-page`.
- **Component**: PascalCase matching the file, always a **named export** (never default): `ListAiConversationsPage`, `DetailsAiConversationPage`, `ListServiceAccountPage`, `EditTeamPage`.
- **Action prefixes** (use these, in this order: action then entity):
  - `list-` → table/collection of records
  - `details-` → read-only detail view, usually with tabs
  - `new-` → creation page
  - `edit-` → edit/management page

## Page-local subfolders

Inside a page folder, colocate page-specific code in these subfolders:

```
<action>-<entity>-page/
  <action>-<entity>-page.tsx
  hooks/        # page-specific hooks, e.g. use-<entity>-list-columns.tsx
  components/   # components used only by this page
  tabs/         # tab content components for a details page (see below)
```

- Keep code that is used by **only one page** inside that page's folder.
- Code shared across **several pages of the same feature** goes in `pages/shared/` with an `index.ts` barrel re-exporting each module.

## Admin pages

Admin (back-office) pages are identified by **`manager`** in their name:

- Folder/file: `<action>-<entity>-manager-page` (e.g. `list-users-manager-page`).
- Component: `<Entity><Action>ManagerPage` (e.g. `UsersListManagerPage`).
- Admin pages **must render a breadcrumb** via `useBreadcrumb` inside `LayoutTopbar`, rooted at `Home`:

```tsx
const { t } = useTranslation();
const breadcrumbs = useBreadcrumb([
  { label: t('adminOrganizations.breadcrumb.home'), to: '/' },
  { label: t('adminOrganizations.breadcrumb.workspaces'), to: '/workspaces' },
], true);
```

Reference: `web-feature-organizations/src/lib/pages/edit-organization-manager-page/edit-organization-manager-page.tsx`, `web-feature-users/src/lib/pages/list-users-manager-page/users-list-manager-page.tsx`.

`manager` means back-office and nothing else. Do **not** use it for a workspace-scoped
"management" page — an edit/management page inside a workspace is `edit-<entity>-page`
(e.g. `edit-team-page`, `edit-security-page`).

## Reuse between surfaces

Reuse flows in one direction only:

- ✅ An admin page **may** import a workspace page's code — but only when that code is
  genuinely generic.
- ❌ A workspace page **must never** import from a `*-manager-page` folder. Admin
  components are built for a cross-workspace context and their routes carry no
  workspace prefix.

This second direction is enforced by `no-restricted-imports` in the root
`eslint.config.mjs`. The first cannot be linted, so it is on the reviewer:

> Code that resolves a current workspace is **not** generic.

Anything calling `useCurrentWorkspaceUrlPrefix()` or `useGetCurrentWorkspaceId()` is
workspace-specific by definition — an admin page reusing it builds dead
`/w//assistant/<id>` links, because the admin routes have no workspace to resolve.
Take the URL builder as an option instead (see `useAiConversationsListColumns({ conversationUrl })`),
or lift the shared part into `pages/shared/`.

A page that must serve both surfaces takes neither name: split it in two, or make it
genuinely surface-agnostic (no workspace hooks, links passed in as props).

## List pages

A `list-*` page renders a `Collection` driven by a columns hook:

- Shell: `LayoutTopbar` (with `useBreadcrumb`) → `LayoutContent` → `LayoutHeader` (title + description).
- Columns come from a hook `hooks/use-<entity>-list-columns.tsx` returning `ColumnDef<Read<Entity>>[]`.
- Wire the `Collection` with `useQueryFn`, `staticParams` (workspace id), `queryFields`, and an `emptyState`.
- Get workspace context from `@skeleton/core-workspace` (`useGetCurrentWorkspaceId`, `useCurrentWorkspaceUrlPrefix`).
- **Admin lists do neither**: they are cross-workspace, so they pass no workspace id in
  `staticParams` and build row links as plain `/<entity>/<id>`. See "Reuse between surfaces".

## Details pages with tabs

A `details-*` page that has tabs:

- Renders `TabNavLinks` + a React Router `<Outlet />`; each tab is a child route, not inline state.
- Tab components live in `tabs/` (e.g. `organization-overview-tab/`, `account-profile-tab/`), named `<Name>Tab`.
- Tab-local hooks/components nest further under `tabs/hooks/` and `tabs/components/`.

## Text

Every user-visible string in a page (titles, descriptions, breadcrumbs, tab titles, buttons, toasts, empty states) goes through `t()` from `useTranslation()` — see the `translations` rule.

## Routing

Pages are mounted in the feature's routes file (`src/lib/routes/<name>-routes.tsx`), not exported through a page barrel. See the `routes` rule for the full routing conventions.
