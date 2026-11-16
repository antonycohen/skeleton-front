import { Link } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import { useGetUserOrganizations } from '@skeleton/core-api';
import type { Organization } from '@skeleton/core-api-models';
import { Badge, BadgeStatus } from '@skeleton/web-components';
import {
  Collection,
  CollectionColumnHeader,
  type CollectionColumnDef,
} from '@skeleton/web-collection';
import { useTranslation } from '@skeleton/core-translations';

/** A date as the back office lists show it, or a dash when there is none or it cannot be read. */
function formatDay(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  return isValid(date) ? format(date, 'dd/MM/yyyy') : '-';
}

/**
 * The workspaces a user is an accepted member of, each linking to its back office page, where its
 * quotas are edited. The user's role in each is not shown: the list endpoint does not carry it.
 */
function useUserWorkspacesColumns(): CollectionColumnDef<Organization>[] {
  const { t } = useTranslation();

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <CollectionColumnHeader
          column={column}
          title={t('adminUsers.detail.workspaces.columns.workspace')}
        />
      ),
      cell: ({ row }) => {
        const label = row.original.name ?? row.original.id;
        return (
          <Link
            to={`/workspaces/${row.original.id}`}
            title={label ?? undefined}
            className="inline-block max-w-64 truncate align-middle body text-foreground underline underline-offset-4"
          >
            {label}
          </Link>
        );
      },
    },
    {
      id: 'type',
      header: () => (
        <span>{t('adminUsers.detail.workspaces.columns.type')}</span>
      ),
      cell: ({ row }) => {
        const { type } = row.original;
        const label =
          type === 'business'
            ? t('adminOrganizations.types.business')
            : type === 'individual'
              ? t('adminOrganizations.types.individual')
              : type;
        return <Badge variant="outline">{label ?? '-'}</Badge>;
      },
      enableSorting: false,
    },
    {
      id: 'status',
      header: () => (
        <span>{t('adminUsers.detail.workspaces.columns.status')}</span>
      ),
      cell: ({ row }) => {
        const { status, deleteAt } = row.original;
        if (status === 'deleted')
          return (
            <BadgeStatus variant="red">
              {t('adminUsers.detail.workspaces.status.deleted')}
            </BadgeStatus>
          );
        if (deleteAt)
          return (
            <BadgeStatus variant="red">
              {t('adminUsers.detail.workspaces.status.deletionPending')}
            </BadgeStatus>
          );
        if (status === 'active')
          return (
            <BadgeStatus variant="green">
              {t('adminUsers.detail.workspaces.status.active')}
            </BadgeStatus>
          );
        return <span className="text-muted-foreground">-</span>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader
          column={column}
          title={t('adminUsers.detail.workspaces.columns.created')}
        />
      ),
      cell: ({ row }) => (
        <span className="body">{formatDay(row.original.createdAt)}</span>
      ),
    },
  ];
}

export function UserWorkspacesSection({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const columns = useUserWorkspacesColumns();

  return (
    <section
      aria-labelledby="user-workspaces-title"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id="user-workspaces-title" className="title">
          {t('adminUsers.detail.workspaces.title')}
        </h2>
        <p className="text-muted-foreground body">
          {t('adminUsers.detail.workspaces.description')}
        </p>
      </div>
      <Collection
        columns={columns}
        useQueryFn={useGetUserOrganizations}
        staticParams={{ userId }}
        defaultSorting={[{ id: 'name', desc: false }]}
        filtersConfiguration={{
          textFilter: {
            placeholder: t('adminUsers.detail.workspaces.search'),
            queryParamName: 'term',
          },
        }}
        emptyState={
          <p className="py-12 text-center body text-muted-foreground">
            {t('adminUsers.detail.workspaces.empty')}
          </p>
        }
        queryFields={{
          id: null,
          name: null,
          type: null,
          status: null,
          deleteAt: null,
          createdAt: null,
        }}
      />
    </section>
  );
}
