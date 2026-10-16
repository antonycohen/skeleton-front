import { ColumnDef } from '@tanstack/react-table';
import { ReadOrganization } from '@skeleton/core-api-models';
import {
  Badge,
  BadgeStatus,
  Button,
  LongText,
} from '@skeleton/web-components';
import {
  CollectionColumnHeader,
  CollectionRowActions,
} from '@skeleton/web-collection';
import { ensureUrlProtocol } from '@skeleton/core-utils';
import { Link } from 'react-router-dom';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';

const TYPE_LABEL_KEYS: Record<string, string> = {
  business: 'adminOrganizations.types.business',
  individual: 'adminOrganizations.types.individual',
};

export function useOrganizationsListColumns(): ColumnDef<ReadOrganization>[] {
  const { t } = useTranslation();
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.list.columns.name')} />
      ),
      cell: ({ row }) => (
        <Button variant="link" className="underline" asChild>
          <Link to={`/workspaces/${row.original.id}`}>
            <LongText className="max-w-48">{row.getValue('name') ?? '-'}</LongText>
          </Link>
        </Button>
      ),
      meta: { className: 'w-48' },
    },
    {
      accessorKey: 'domain',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.list.columns.domain')} />
      ),
      cell: ({ row }) => {
        const domain = row.getValue('domain') as string | null;
        if (!domain) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <a
            // The API stores bare domains ("example.com"); without a scheme the
            // browser reads the href as a relative path and navigates in-app.
            href={ensureUrlProtocol(domain)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {domain}
          </a>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.list.columns.type')} />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string | null;
        return type ? (
          <Badge variant="outline" className="capitalize">
            {TYPE_LABEL_KEYS[type] ? t(TYPE_LABEL_KEYS[type]) : type}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      filterFn: 'equals',
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.list.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string | null;
        if (status === 'active')
          return <BadgeStatus variant="green">{t('adminOrganizations.list.status.active')}</BadgeStatus>;
        if (status === 'deleted')
          return <BadgeStatus variant="red">{t('adminOrganizations.list.status.deleted')}</BadgeStatus>;
        return <span className="text-muted-foreground">-</span>;
      },
      filterFn: 'equals',
    },
    {
      // Two plain fields of the workspace, readable by anyone who reads it: no extra request, and
      // nothing of the connection itself, which is admin-only.
      id: 'sso',
      header: () => <span>{t('adminOrganizations.list.columns.sso')}</span>,
      cell: ({ row }) => {
        const { ssoAvailable, ssoStatus } = row.original;
        if (!ssoAvailable) {
          return <span className="text-muted-foreground">-</span>;
        }
        if (ssoStatus === 'enforced')
          return <BadgeStatus variant="green">{t('adminOrganizations.sso.status.enforced')}</BadgeStatus>;
        if (ssoStatus === 'enabled')
          return <BadgeStatus variant="green">{t('adminOrganizations.sso.status.enabled')}</BadgeStatus>;
        // Entitled, but the workspace has not walked its connection to a live state yet.
        return <BadgeStatus variant="blue">{t('adminOrganizations.list.ssoAvailable')}</BadgeStatus>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.list.columns.created')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('createdAt') as string | null;
        return <div>{value ? format(new Date(value), 'dd/MM/yyyy') : '-'}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <CollectionRowActions
          row={row}
          actions={[
            {
              label: t('adminOrganizations.list.editAction'),
              icon: IconEdit,
              linkTo: (org: ReadOrganization) => `/workspaces/${org.id}`,
            },
            {
              label: t('adminOrganizations.list.deleteAction'),
              icon: IconTrash,
              group: 'danger',
              className: 'text-red-500!',
              linkTo: (org: ReadOrganization) => `/workspaces/${org.id}`,
            },
          ]}
        />
      ),
    },
  ];
}
