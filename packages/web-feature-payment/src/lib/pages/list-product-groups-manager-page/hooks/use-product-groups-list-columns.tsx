import { ColumnDef } from '@tanstack/react-table';
import { ReadProductGroup } from '@skeleton/core-api-models';
import { BadgeStatus, Button, LongText } from '@skeleton/web-components';
import {
  CollectionColumnHeader,
  CollectionRowActions,
} from '@skeleton/web-collection';
import { Link } from 'react-router-dom';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';

export function useProductGroupsListColumns(): ColumnDef<ReadProductGroup>[] {
  const { t } = useTranslation();

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminPayment.productGroups.column.name')} />
      ),
      cell: ({ row }) => (
        <Button variant="link" className="underline" asChild>
          <Link to={`/payment/product-groups/${row.original.id}`}>
            <LongText className="max-w-48">{row.getValue('name') ?? '-'}</LongText>
          </Link>
        </Button>
      ),
      meta: { className: 'w-48' },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminPayment.productGroups.column.description')} />
      ),
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null;
        return description ? (
          <LongText className="max-w-96 text-muted-foreground">
            {description}
          </LongText>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'active',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminPayment.productGroups.column.status')} />
      ),
      cell: ({ row }) => {
        const active = row.getValue('active') as boolean | null;
        return active ? (
          <BadgeStatus variant="green">{t('adminPayment.status.active')}</BadgeStatus>
        ) : (
          <BadgeStatus variant="red">{t('adminPayment.status.inactive')}</BadgeStatus>
        );
      },
      filterFn: 'equals',
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminPayment.productGroups.column.created')} />
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
              label: t('adminPayment.productGroups.action.edit'),
              icon: IconEdit,
              linkTo: (group: ReadProductGroup) =>
                `/payment/product-groups/${group.id}`,
            },
            {
              label: t('adminPayment.productGroups.action.delete'),
              icon: IconTrash,
              group: 'danger',
              className: 'text-red-500!',
              linkTo: (group: ReadProductGroup) =>
                `/payment/product-groups/${group.id}`,
            },
          ]}
        />
      ),
    },
  ];
}
