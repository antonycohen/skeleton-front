---
name: create-page
description: Scaffold a new page in a web-feature-* package following project conventions. Use when the user asks to create/add a page, screen, list, detail/tabs, create form, or edit page in a feature. Runs the discovery steps (surface, kind, entry point, prerequisites, plan), then dispatches to the matching kind-specific sub-skill.
argument-hint: [feature] [list|detail|new|edit] [admin|workspace]
---

# Create a Page

Router skill for scaffolding a page in a `web-feature-*` package. This skill owns **discovery and planning** (Steps 1-5) and the **shared finishing checklist**. The kind-specific scaffolding lives in a sub-skill:

- **list** → `create-list-page`
- **detail** → `create-detail-page`
- **new** → `create-new-page`
- **edit** → `create-edit-page`

Authoritative rules:

- `page-components` → folder/file/component naming, page-local subfolders, list/detail composition.
- `list-columns-hooks` → the columns hook for list pages.
- `routes` → how the page is mounted (admin BO app vs workspace customer app).
- `translations` → every user-visible string goes through `t()`, keys added to both `en` and `fr`.

## Step 1 — Determine the surface (REQUIRED before scaffolding)

If the user has **not** made it clear whether this is an **admin** or **workspace** page, ask before doing anything else (use AskUserQuestion):

- **Admin (back-office)** — lives in `skeleton-bo-app`, mounted at a fixed top-level path, route component `Admin<Entity>Routes`. Page names include **`manager`** (`<action>-<entity>-manager-page`, component `<Entity><Action>ManagerPage`) and **must render a breadcrumb** rooted at `Home`.
- **Workspace (customer)** — lives in `skeleton-app` under `/w/:organizationId`, route component `<Feature>Routes`. Build links with `useCurrentWorkspaceUrlPrefix()`; never hardcode `/w/...`.

## Step 2 — Determine the kind of page (REQUIRED before scaffolding)

If the user has **not** specified the page kind, ask (use AskUserQuestion). Supported kinds:

- **list** — a `Collection` table of records.
- **detail** — a read view, usually with tabs (`TabNavLinks` + `<Outlet />`).
- **new** — a creation page/form.
- **edit** — an edit/management page (often with tabs).

Also confirm the **feature package** and the **entity name** if not already known. For **detail** and **edit**, confirm the **tab list**.

## Step 3 — Determine the page level + entry point (REQUIRED before scaffolding)

A page lives at one of two **levels**, and that choice drives the file shape, the shell, and how it's routed. If the user has not made this clear, ask (use AskUserQuestion).

### Level A — Top-level page (own route, optional sidebar entry)

A standalone page that owns its own URL segment. Has its **own shell** (`LayoutTopbar` → `LayoutContent` → `LayoutHeader`) and is mounted directly in the feature's `*Routes`. Typically reached from the sidebar or the user menu, but may also be link-only.

Pick the entry point:

- **Sidebar — main nav** → `mainNavigationGroups` (which group/section?).
- **Sidebar — footer nav** → `footerNavigationGroups`.
- **User menu** → `navUserItems`.
- **No link** → reachable only by direct URL / programmatic navigation.

References: `ListServiceAccountPage` (workspace), `AccountSettingsPage` (workspace), `OrganizationsListManagerPage` / `OrganizationEditManagerPage` (admin).

### Level B — Nested page (a tab inside an existing page)

A page that is rendered *inside* an existing top-level edit/detail page's `<Outlet />`. It has **no own shell** (the parent provides the topbar/header), lives under the parent's `tabs/` folder, and is wired as a child `<Route>` of the parent's layout route. The entry point is a new entry in the parent's `getTabItems` (`TabNavLinks`) — there is no sidebar entry.

Confirm which parent page (`tabs/` folder + `TabNavLinks`) the new tab is being added to.

References: `AccountProfileTab` inside `AccountSettingsPage`, `OrganizationQuotasTab` inside `OrganizationEditManagerPage`.

> All four kinds (`list`, `detail`, `new`, `edit`) can be built at either level. The kind-specific sub-skill documents both shapes; pass the chosen level to it.

## Step 4 — Check prerequisites (model, endpoint, query)

A page needs data plumbing. Before scaffolding, verify each piece exists; if any is missing, ask the user whether to create it (or create it following the relevant skill) — do **not** invent or assume it.

- **Model** — does `packages/core-api-models/src/lib/<entity>/` define the needed schema/type (e.g. `Read<Entity>`, `Update<Entity>Info`, `Create<Entity>Info`)? If not, ask; create via the `api-model-guide` skill.
- **Endpoint** — does `core-api` expose the endpoint for this entity/action? If not, ask; create via the `api-request-guide` skill.
- **Query/mutation hook** — does the hook the page will call already exist (`useGet<Entities>`, `useGet<Entity>ById`, `useCreate<Entity>`, `useUpdate<Entity>`, `useDelete<Entity>`)? If not, ask; create via the `api-request-guide` skill.

Grep `core-api` and `core-api-models` to confirm before asking, so you only ask about what is genuinely missing.

## Step 5 — Expose your plan (REQUIRED before writing any code)

Always present a short plan and let the user confirm before scaffolding. It must state at minimum:

- **Page name** — the folder/file and component name (e.g. top-level: `list-ai-conversations-page` → `ListAiConversationsPage`; nested: `organization-quotas-tab/organization-quotas-tab.tsx` → `OrganizationQuotasTab`).
- **Level** — top-level or nested-as-tab (and, if nested, the parent page).
- **Query/mutation hooks to use** — the exact hooks the page will call (e.g. `useGetServiceAccounts`, `useUpdateServiceAccount`), and note any that need to be created first.
- **Columns / tabs** — for list pages, the columns you will create (accessor + header label + cell type, including the `actions` column); for detail/edit, the tabs you will create.
- **Entry point** — sidebar nav param + section (top-level) **or** the parent page's `TabNavLinks` entry (nested), per Step 3.
- **Translations** — the namespace file the new keys go into (existing or new `<namespace>.json` in both `en` and `fr`).

## Step 6 — Dispatch to the kind-specific sub-skill

Once the plan is confirmed, invoke the matching sub-skill via the Skill tool. The sub-skill assumes Steps 1-5 are done and contains the kind-specific page/tab/form/route checklist:

| Kind     | Sub-skill            |
| -------- | -------------------- |
| `list`   | `create-list-page`   |
| `detail` | `create-detail-page` |
| `new`    | `create-new-page`    |
| `edit`   | `create-edit-page`   |

Then return here for the shared finishing steps below.

## Shared finishing steps (all kinds)

Run these after the sub-skill's kind-specific checklist. Some items only apply at one level — skip the others.

**Both levels:**

- [ ] If the package is new or newly styled, add it to `@source` in `apps/skeleton-app/src/styles.css` and run `npx nx sync`
- [ ] Every user-visible string (title, description, breadcrumb, tab titles, column headers, actions, toasts, empty state, nav entry) uses `t('<namespace>.…')` with a literal key; keys added to **both** `packages/core-translations/src/lib/translations/en/<namespace>.json` and `fr/<namespace>.json`, reusing `common.*` where possible (see the `translations` rule)
- [ ] `node scripts/check-translations.mjs` passes
- [ ] `npx nx typecheck @skeleton/web-feature-<feature>` passes

**Top-level pages only:**

- [ ] If `routes/<name>-routes.tsx` did not exist before, create the `*Routes` component (`Admin<Entity>Routes` for admin, `<Feature>Routes` for workspace) and export it from the package's `src/index.ts`
- [ ] **Admin:** mount `Admin<Entity>Routes` in `apps/skeleton-bo-app/src/app/routes/protected-routes.tsx`
- [ ] **Workspace:** mount `<Feature>Routes` in `apps/skeleton-app/src/app/routes/workspace-routes.tsx` (or `workspace-settings-routes.tsx`)
- [ ] Add the sidebar/menu entry chosen in Step 3 — the `UserLayout` nav param + section (`mainNavigationGroups` / `footerNavigationGroups` / `navUserItems`); skip if "no link"

**Nested pages (tab) only:**

- [ ] Add the new entry to the parent page's `getTabItems(...)` so it shows up in `TabNavLinks`
- [ ] Add the child `<Route>` for the tab inside the parent's layout `<Route>` in the feature's `routes/<name>-routes.tsx`
- [ ] No app-level mount, no `*Routes` export, no sidebar entry — the parent page already owns those
