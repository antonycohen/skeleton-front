---
name: create-edit-page
description: Scaffold an edit/management page (often tabbed) in a web-feature-* package. Invoked by create-page once the user has confirmed kind=edit, the surface (admin/workspace), the feature, the entity, the tabs, and the entry point. Do not invoke directly unless the caller has already completed those discovery steps.
argument-hint: [feature] [entity] [admin|workspace]
---

# Create an Edit Page

Scaffolds an `edit-*` (or `*-settings-page`) — an editable management page, usually tabbed. Assumes the caller (`create-page`) has already resolved surface, feature, entity, tabs, entry point, prerequisites (`useGet<Entity>ById`, `useUpdate<Entity>`, plus any `useDelete<Entity>`), and plan. If anything is unclear, stop and run `create-page` first.

Authoritative rules: `page-components`, `routes`, `translations`.

References:

- `web-feature-organizations/src/lib/pages/edit-organization-manager-page` — admin, tabbed, no shared data (each tab reads `:organizationId` with `useParams()` and loads/saves its own slice).
- `web-feature-users/src/lib/pages/account-settings-page` — workspace, tabbed, shared data via outlet context.

## Shared (both levels) — Form hook

**Form hook** (named export `use<Name>Form`; location depends on level — see below).

Reference: `web-feature-users/.../tabs/account-profile-tab/hooks/use-account-profile-form.ts`.

- [ ] Signature accepts the loaded entity as an optional arg: `use<Name>Form(entity?: Read<Entity>)`
- [ ] `useForm<Update<Entity>Info>({ resolver: zodResolver(update<Entity>InfoSchema), defaultValues: { …empty… }, values: entity ? { …mapped from entity… } : undefined })` — use `values` (not `defaultValues`) so the form resets when the async entity arrives
- [ ] Pull the schema + inferred type from `@skeleton/core-api-models` (`update<Entity>InfoSchema`, `Update<Entity>Info`); if missing, create them via the `api-model-guide` skill
- [ ] Wire mutations from `@skeleton/core-api` (`useUpdate<Entity>`, plus `useDelete<Entity>` etc. when the tab also exposes destructive actions). Standard wiring:
  - `onSuccess: () => toast.success(t('<namespace>.update.success'))` (from `sonner`, `t` from `useTranslation()`)
  - `onError: (error) => handleApiError(error, form)` (from `@skeleton/web-form`) — this maps server-side field errors back onto the form
- [ ] `handleSubmit = form.handleSubmit((data) => { if (!entity) return; mutate({ <entityId>: entity.id as string, data }); })`
- [ ] Schema validation messages are `validation.*` keys; labels, placeholders, buttons, toasts and tab titles use `t()`; new keys added to both `en` and `fr`
- [ ] Return shape consumed by the tab: `{ form, handleSubmit, isUpdating: updateMutation.isPending, …other handlers and isPending flags as needed }` — the tab passes `isLoading={isUpdating}` to the submit `Button`

## Level A — Top-level edit page (own shell + own tabs)

This is the `OrganizationEditManagerPage` / `AccountSettingsPage` shape.

**Page shell** (`pages/edit-<entity>[-manager]-page/edit-<entity>[-manager]-page.tsx`, named export `Edit<Entity>Page` / `<Entity>Edit<Scope>ManagerPage`):

- [ ] Shell: `LayoutTopbar` (admin: with `useBreadcrumb`) → `LayoutContent` → `LayoutHeader` (pageTitle) → `TabNavLinks` → `<div className="flex flex-col h-full max-w-4xl"><div className="flex-1"><Outlet /></div></div>`
- [ ] Define `getTabItems(baseUrl, t)` at module scope returning `{ title, url }[]` (titles via `t()`); urls are absolute (`${baseUrl}/<feature-segment>/<tab-path>`) so they match the mounted route exactly
- [ ] Resolve `baseUrl`:
  - **Workspace, self-contained feature** → call `useCurrentWorkspaceUrlPrefix()` inside the page
  - **Workspace, page mounted by a parent that already knows the prefix** (e.g. account settings) → accept `baseUrl` as a prop and forward it from the `*Routes` component
  - **Admin** → urls are absolute from `/`, no prefix hook

**Data loading (optional shared-data pattern):**

If multiple tabs need the same entity, load it once in the page and pass it through `Outlet` context — do **not** refetch in each tab:

- [ ] Add `types.ts` in the page folder defining `<Entity>OutletContext` (e.g. `{ user: ReadUser | undefined; isLoading: boolean }`)
- [ ] Add `hooks/use-get-<entity>-for-<page>.ts` wrapping the `core-api` get-by-id hook with the exact `fields` projection the tabs need
- [ ] In the page: `<Outlet context={outletContext satisfies <Entity>OutletContext} />`
- [ ] In each tab: `const { entity, isLoading } = useOutletContext<<Entity>OutletContext>()`

If tabs are independent (each loads/saves its own slice, like `OrganizationEditManagerPage`), skip the outlet context — each tab calls its own hook directly via `useGetCurrentWorkspaceId()` / `useParams()` and its own get-by-id query.

**Owned tabs** (one folder or file per tab under `tabs/`):

- [ ] File `tabs/<name>-tab.tsx` (or `tabs/<name>-tab/<name>-tab.tsx` when the tab has its own `hooks/` / `modals/` / `components/`), named export `<Name>Tab`
- [ ] Tab renders a form built with `@skeleton/web-form` (`createConnectedInputHelpers<Update<Entity>Info>()`) wrapped in `<FormProvider>`; submit via the `core-api` update hook
- [ ] Tab-local form/state lives in `tabs/<name>-tab/hooks/use-<name>-form.ts`; tab-only dialogs in `tabs/<name>-tab/modals/`

**Routing** (in `routes/<name>-routes.tsx`):

- [ ] Mount the page as a layout route with its own tabs as children:
  ```tsx
  <Route element={<Edit<Entity>Page />}>
    <Route index element={<Navigate to="<first-tab>" replace />} />
    <Route path="<tab-1>" element={<Tab1 />} />
    {/* …one child Route per tab… */}
  </Route>
  ```
- [ ] Admin / detail-style edit (under a `:<entityId>` segment) → wrap in `<Route path=":<entityId>" element={<Edit<Entity>Page />}>` instead
- [ ] Prefer the explicit `<Route index><Navigate to="…" replace /></Route>` for the default tab (matches `AdminOrganizationsRoutes`); a pathless layout route with explicit tab paths (matches `AccountRoutes`) is also acceptable — pick one and be consistent within the feature
- [ ] If the page needs a `baseUrl` prop, pass it from the `*Routes` component: `<Edit<Entity>Page baseUrl={baseUrl} />`

## Level B — Nested edit (a single edit tab inside an existing page)

This is what the *individual* tabs of `OrganizationEditManagerPage` / `AccountSettingsPage` look like — adding one more edit slice to an existing edit page.

File / component (inside the parent page's `tabs/`):

- [ ] `pages/<parent-edit-page>/tabs/<name>-tab.tsx` (or `tabs/<name>-tab/<name>-tab.tsx` with its own `hooks/` / `modals/` / `components/`), named export `<Name>Tab`
- [ ] **No** `LayoutTopbar` / `LayoutContent` / `LayoutHeader` / `TabNavLinks` — the parent page already provides the shell + tab bar. Render the form (typically inside a `<Card>`) directly.
- [ ] Wrap in `<FormProvider>` with `createConnectedInputHelpers<Update<Entity>Info>()`; submit button uses `isLoading={isUpdating}`
- [ ] Form hook lives at `tabs/<name>-tab/hooks/use-<name>-form.ts` (see "Shared — Form hook" above)
- [ ] Data source:
  - Parent uses the outlet-context pattern → `const { entity, isLoading } = useOutletContext<<Entity>OutletContext>()`
  - Parent's tabs are independent (à la `OrganizationEditManagerPage`) → fetch directly with `useGetCurrentWorkspaceId()` / `useParams()` and the relevant get-by-id query

Routing (in the parent feature's `routes/<name>-routes.tsx`):

- [ ] Add a new entry to the parent's `getTabItems(...)` (`{ title: '<Tab title>', url: '${baseUrl}/<parent>/<segment>' }`)
- [ ] Add the child `<Route path="<segment>" element={<<Name>Tab />} />` inside the parent's layout `<Route element={<ParentEdit…Page />}>` block — do **not** create a new layout route

## Finishing

See `create-page` SKILL.md "Shared finishing steps" — apply the **top-level** or **nested** subset depending on the level you built.
