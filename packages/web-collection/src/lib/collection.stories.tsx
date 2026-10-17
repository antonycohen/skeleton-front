import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { ColumnDef } from '@tanstack/react-table';
import { BanIcon, CheckCircle2Icon, ClockIcon, MailIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useGetUsers } from '@skeleton/core-api';
import type { User, UserStatus } from '@skeleton/core-api-models';
import { Avatar, AvatarFallback, Badge, Button } from '@skeleton/web-components';
import { api, collection, daysAgo, makeUser, mock, users } from '@skeleton/storybook-support';
import { Collection } from './collection';
import { CollectionColumnHeader } from './collection-column-header';
import { CollectionRowActions } from './collection-row-actions';

const FIRST_NAMES = ['Lucas', 'Chloé', 'Nathan', 'Manon', 'Jules', 'Emma', 'Louis', 'Zoé', 'Arthur', 'Alice'];
const LAST_NAMES = ['Martin', 'Petit', 'Durand', 'Leroy', 'Roux', 'Fournier', 'Girard', 'Bonnet', 'Lambert'];
const DOMAINS = ['acme.io', 'globex.com', 'initech.fr', 'umbrella.co', 'hooli.xyz'];
const STATUSES: UserStatus[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING', 'INVITED'];

/** Some thirty users: enough for four pages of ten. */
const manyUsers: User[] = [
  ...users,
  ...Array.from({ length: 26 }, (_, i) => {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    return makeUser(10 + i, {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${DOMAINS[i % DOMAINS.length]}`.normalize('NFD').replace(/[̀-ͯ]/g, ''),
      status: STATUSES[i % STATUSES.length],
      createdAt: daysAgo(3 + i * 4),
    });
  }),
];

/** `GET /users`, honouring the text filter (`term`) and the status facet. */
const usersHandler = http.get(api('/users'), ({ request }) => {
  const params = new URL(request.url).searchParams;
  const term = params.get('term')?.toLowerCase();
  const statuses = [...params.getAll('status'), ...params.getAll('status[]')].flatMap((s) => s.split(',')).filter(Boolean);
  const matching = manyUsers.filter(
    (u) =>
      (!term || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(term)) &&
      (statuses.length === 0 || statuses.includes(u.status as string)),
  );
  return collection(matching, request);
});

const STATUS_BADGES: Record<UserStatus, { label: string; variant: 'success' | 'warning' | 'important' | 'outline' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  PENDING: { label: 'Pending', variant: 'warning' },
  INVITED: { label: 'Invited', variant: 'important' },
  DELETED: { label: 'Deleted', variant: 'outline' },
};

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE', icon: CheckCircle2Icon },
  { label: 'Pending', value: 'PENDING', icon: ClockIcon },
  { label: 'Invited', value: 'INVITED', icon: MailIcon },
];

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorFn: (u) => `${u.firstName} ${u.lastName}`,
    header: ({ column }) => <CollectionColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {row.original.firstName?.[0]}
            {row.original.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <CollectionColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const badge = STATUS_BADGES[row.original.status ?? 'PENDING'];
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <CollectionColumnHeader column={column} title="Joined" />,
    cell: ({ row }) =>
      row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—',
  },
];

const actionsColumn: ColumnDef<User> = {
  id: 'actions',
  enableHiding: false,
  meta: { className: 'w-12' },
  cell: ({ row }) => (
    <div onClick={(event) => event.stopPropagation()}>
      <CollectionRowActions
        row={row}
        actions={[
          { label: 'Edit', icon: PencilIcon, linkTo: (u) => `/users/${u.id}`, group: 'main' },
          {
            label: 'Resend invitation',
            icon: MailIcon,
            onClick: fn(),
            group: 'main',
            disabledReason: row.original.status === 'INVITED' ? null : 'Only invited users get an invitation.',
          },
          { label: 'Suspend', icon: BanIcon, onClick: fn(), group: 'danger' },
          { label: 'Delete', icon: Trash2Icon, onClick: fn(), group: 'danger', className: 'text-destructive' },
        ]}
      />
    </div>
  ),
};

const QUERY_FIELDS = { id: null, firstName: null, lastName: null, email: null, status: null, createdAt: null };

/** A server-paginated table: here `useGetUsers` against the mocked `GET /users`. */
const meta = {
  title: 'Patterns/Collection/Collection',
  component: Collection<User>,
  parameters: { layout: 'padded', msw: [usersHandler] },
  args: {
    columns,
    useQueryFn: useGetUsers,
    queryFields: QUERY_FIELDS,
    filtersConfiguration: { textFilter: { placeholder: 'Search users...', queryParamName: 'term' } },
  },
  argTypes: {
    columns: { control: false },
    useQueryFn: { control: false },
  },
} satisfies Meta<typeof Collection<User>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Text filter, four pages. */
export const Default: Story = {};

/** The status facet next to the search. */
export const FacetedFilter: Story = {
  args: {
    filtersConfiguration: {
      textFilter: { placeholder: 'Search users...', queryParamName: 'term' },
      facetedFilters: [{ columnId: 'status', queryParamName: 'status', title: 'Status', options: STATUS_OPTIONS }],
    },
  },
};

/** The search narrowed to one company. */
export const Searched: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Search users...'), 'globex');
    await expect(await canvas.findByText('sarah.cohen@globex.com')).toBeInTheDocument();
  },
};

export const SecondPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('lea.bernard@acme.io');
    await userEvent.click(canvas.getByRole('button', { name: /next page/i }));
  },
};

/** A menu per row: links, callbacks, a greyed-out action with its reason, grouped with separators. */
export const RowActions: Story = {
  args: { columns: [...columns, actionsColumn], onRowClick: fn() },
};

export const RowActionsOpen: Story = {
  args: { columns: [...columns, actionsColumn] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('lea.bernard@acme.io');
    await userEvent.click(canvas.getAllByRole('button', { name: 'Open menu' })[1]);
  },
};

export const Selectable: Story = { args: { canBeSelected: true, onSelectionChange: fn() } };

export const SingleSelection: Story = {
  args: { canBeSelected: true, singleSelection: true, onSelectionChange: fn() },
};

/** Toolbar extras: the column picker and custom actions. */
export const ToolbarActions: Story = {
  args: {
    showColumnSelector: true,
    toolbarActions: (
      <Button size="sm">
        <PlusIcon /> Invite member
      </Button>
    ),
  },
};

export const Loading: Story = { parameters: { msw: [mock.loading('/users')] } };

export const Empty: Story = {
  args: {
    emptyState: (
      <div className="flex flex-col items-center gap-1 py-6">
        <span className="font-medium text-foreground">No team members yet</span>
        <span className="text-muted-foreground">Invite your colleagues to work together in this workspace.</span>
      </div>
    ),
  },
  parameters: { msw: [mock.empty('/users')] },
};

/** A failing request renders as an empty table. */
export const Failed: Story = { name: 'Error', parameters: { msw: [mock.error('/users')] } };
