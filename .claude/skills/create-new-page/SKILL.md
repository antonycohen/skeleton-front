---
name: create-new-page
description: Scaffold a new-entity creation page (single form) in a web-feature-* package. Invoked by create-page once the user has confirmed kind=new, the surface (admin/workspace), the feature, the entity, and the entry point. Do not invoke directly unless the caller has already completed those discovery steps.
argument-hint: [feature] [entity] [admin|workspace]
---

# Create a "New" Page

Scaffolds a `new-*` page (single creation form). Assumes the caller (`create-page`) has already resolved surface, feature, entity, entry point, prerequisites (`useCreate<Entity>`), and plan. If anything is unclear, stop and run `create-page` first.

Authoritative rules: `page-components`, `routes`, `translations`.

## Shared (both levels) — Form hook

**Form hook** (named export `useNew<Entity>Form`; location depends on level — see below):

- [ ] `useForm<Create<Entity>Info>({ resolver: zodResolver(create<Entity>InfoSchema), defaultValues: { …empty… } })`
- [ ] Pull the schema + inferred type from `@skeleton/core-api-models` (`create<Entity>InfoSchema`, `Create<Entity>Info`); if missing, create them via the `api-model-guide` skill
- [ ] `useCreate<Entity>` from `@skeleton/core-api`:
  - `onSuccess: (created) => { toast.success(t('<namespace>.create.success')); <navigate or reset depending on level>; }` (toast from `sonner`, `t` from `useTranslation()`)
  - `onError: (error) => handleApiError(error, form)` (from `@skeleton/web-form`)
- [ ] `handleSubmit = form.handleSubmit((data) => createMutation.mutate({ data }))`
- [ ] Return `{ form, handleSubmit, isCreating: createMutation.isPending }`
- [ ] Schema validation messages are `validation.*` keys; field labels, placeholders, buttons and toasts use `t()`; new keys added to both `en` and `fr`

## Level A — Top-level "new" page

File / component:

- [ ] `pages/new-<entity>[-manager]-page/new-<entity>[-manager]-page.tsx`, named export `New<Entity>Page` / `<Entity>New<Scope>ManagerPage`
- [ ] Shell: `LayoutTopbar` (admin: with `useBreadcrumb`) → `LayoutContent` → `LayoutHeader` (title)
- [ ] Renders the create form wrapped in `<FormProvider>`; submit button uses `isLoading={isCreating}`
- [ ] Form hook lives at `hooks/use-new-<entity>-form.ts`
- [ ] `onSuccess` navigates to the detail or list route — workspace links via `useCurrentWorkspaceUrlPrefix()`, admin via absolute `/`

Routing (in `routes/<name>-routes.tsx`):

- [ ] Add `<Route path="new" element={<New<Entity>Page />} />` to the feature's `*Routes` component

## Level B — Nested "new" (tab in an existing page)

File / component (inside the parent page's `tabs/`):

- [ ] `pages/<parent-page>/tabs/new-<entity>-tab.tsx` (or `tabs/new-<entity>-tab/new-<entity>-tab.tsx` with its own `hooks/`), named export `New<Entity>Tab`
- [ ] **No** `LayoutTopbar` / `LayoutContent` / `LayoutHeader` — the parent page provides the shell. Render the form (e.g. in a `<Card>`) directly.
- [ ] Form hook lives at `tabs/new-<entity>-tab/hooks/use-new-<entity>-form.ts`
- [ ] `onSuccess` typically resets the form (`form.reset()`) and/or invalidates the sibling list; navigating away is unusual since the parent owns the URL

Routing (in the parent feature's `routes/<name>-routes.tsx`):

- [ ] Add a new entry to the parent's `getTabItems(...)` (`{ title: 'New <Entity>', url: '${baseUrl}/<parent>/new' }`)
- [ ] Add the child `<Route path="new" element={<New<Entity>Tab />} />` inside the parent's layout `<Route element={<Parent…Page />}>` block

## Finishing

See `create-page` SKILL.md "Shared finishing steps" — apply the **top-level** or **nested** subset depending on the level you built.
