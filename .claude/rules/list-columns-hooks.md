---
paths:
  - "packages/web-feature-*/src/lib/pages/**/hooks/use-*-columns.tsx"
---

# List Columns Hooks

Conventions for the hooks that define a `Collection`/table's columns. Reference implementations: `use-service-account-list-columns.tsx`, `use-team-members-columns.tsx`, `use-ai-conversations-list-columns.tsx`, `use-users-list-columns.tsx` (back office).

## Location & naming

- Live in the owning page's `hooks/` folder: `<page>/hooks/use-<entity>-columns.tsx` (or `use-<entity>-list-columns.tsx`).
- Always `.tsx` — cells return JSX.
- Hook is a **named export** in PascalCase-after-`use`: `useServiceAccountListColumns`, `useTeamMembersColumns`, `useAiConversationsListColumns`.

## Signature

Return `ColumnDef<TModel>[]`, where `TModel` is the row's model type from `@skeleton/core-api-models` (`ServiceAccount`, `OrganizationMember`, `AiConversation`, …):

```tsx
export function useTeamMembersColumns(
  options: UseTeamMembersColumnsOptions,
): ColumnDef<OrganizationMember>[] { … }
```

- Pass per-row action callbacks and required context through a single `options` object (e.g. `conversationUrl`, `onChangeRole`, `onDelete`). Type it as `Use<Name>ColumnsOptions`.
- Callbacks are **optional** (`onX?:`) and invoked with optional chaining (`onX?.(row.original)`).
- Pull ambient context from hooks inside the columns hook when it isn't row-specific (e.g. `useCurrentWorkspaceUrlPrefix()` for building links).

## Column definitions

- **Accessor**: `accessorKey: 'field'` for direct fields; `id` + `accessorFn` for derived values; `id` only for non-data columns (`actions`, computed).
- **Header**: sortable/standard columns use `({ column }) => <CollectionColumnHeader column={column} title={t('…')} />` (from `@skeleton/web-collection`). Plain display headers use `() => <span>{t('…')}</span>`; the actions header is right-aligned: `() => <div className="text-right">{t('common.actions')}</div>`.
- **Text**: every header, label, fallback and action label goes through `t()` from `useTranslation()` (`@skeleton/core-translations`), called at the top of the columns hook — see the `translations` rule.
- **Cell**: `({ row }) => …` reading `row.original`. Always null-guard nullable model fields (`?? '-'`, `?? 0`).
- **Flags & sizing**: set `size` / `minSize`, `enableSorting`, `enableHiding`, `filterFn: 'equals'`, and `meta: { className: 'min-w-[200px]' }` as needed.

## Common cell patterns

- **Status**: render with `BadgeStatus` (`green` / `red` / `yellow` / `blue`) via early-return branches per status value.
- **Roles / tags**: `Badge` with a `variant` looked up from a `Record<string, …>` map declared at module top.
- **Identity**: `Avatar` + `AvatarImage`/`AvatarFallback` (initials), name over email.
- **Dates**: `date-fns` `format(value, 'dd/MM/yyyy')` or `new Date(value).toLocaleDateString('en-GB')`; render `'-'` when null.
- **Links**: `Button variant="link" asChild` wrapping a `react-router-dom` `<Link>` built from `useCurrentWorkspaceUrlPrefix()`.

## Actions column

Always the **last** column, `id: 'actions'`, right-aligned header, using `CollectionRowActions` from `@skeleton/web-collection`:

```tsx
<CollectionRowActions
  row={row}
  actions={[
    { label: t('teams.members.changeRole'), icon: UserCog, onClick: (m) => onChangeRole?.(m) },
    { label: t('ai.conversations.open'), icon: MessageSquare, linkTo: (c) => `${workspaceBaseUrl}/assistant/${c.id}` },
    { label: t('adminOrganizations.quotas.adjust'), icon: IconPencil, dialog: { id: 'adjust-quota', component: AdjustQuotaModal } },
    { label: t('common.delete'), icon: Trash, group: 'danger', className: 'text-red-500!', onClick: (x) => onDelete?.(x) },
  ]}
/>
```

- Each action is one of: `onClick`, `linkTo: (row) => url`, or `dialog: { id, component }`.
- Destructive actions set `group: 'danger'` and a red class (`text-red-500!` or `text-destructive`).
- Build the `actions` array conditionally (e.g. spread `...(isAdjustable(row.original) ? [...] : [])`, or enable/disable depending on a service account's status) to vary actions per row state.
- Primary CTAs (e.g. "Open") may sit as inline `Link`+`Button` next to `CollectionRowActions` inside a right-aligned flex container.
