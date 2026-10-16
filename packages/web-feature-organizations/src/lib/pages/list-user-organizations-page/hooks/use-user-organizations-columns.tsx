import {ColumnDef} from '@tanstack/react-table';
import {Organization} from '@skeleton/core-api-models';
import {Avatar, AvatarFallback, Badge, BadgeStatus, PlanBadge} from '@skeleton/web-components';
import {CollectionColumnHeader, CollectionRowActions} from '@skeleton/web-collection';
import {format} from 'date-fns';
import {GalleryVerticalEnd, Pen, Settings, Trash} from 'lucide-react';
import {useTranslation} from '@skeleton/core-translations';

type UseUserOrganizationsColumnsOptions = {
  onManageWorkspace?: (organization: Organization) => void;
  onRenameWorkspace?: (organization: Organization) => void;
  onDeleteWorkspace?: (organization: Organization) => void;
};

export function useUserOrganizationsColumns(
  options: UseUserOrganizationsColumnsOptions = {},
): ColumnDef<Organization>[] {
  const { onManageWorkspace, onRenameWorkspace, onDeleteWorkspace } = options;
  const { t } = useTranslation();

  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('userWorkspaces.columns.workspace')} />
      ),
      cell: ({ row }) => {
        const { name } = row.original;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6 rounded-sm">
              <AvatarFallback className="rounded-sm text-xs">
                <GalleryVerticalEnd className="size-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold">{name ?? t('common.unnamed')}</span>
          </div>
        );
      },
      meta: { className: 'min-w-[200px]' },
      enableSorting: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('userWorkspaces.columns.created')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue('createdAt')
            ? format(row.getValue('createdAt'), 'dd/MM/yyyy')
            : '-'}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: 'users',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('userWorkspaces.columns.users')} />
      ),
      cell: ({ row }) => {
        const count = row.original.statistics?.activeMembersCount ?? 0;
        return <span className="text-sm">{count}</span>;
      },
    },
    {
      id: 'status',
      header: () => <span>{t('userWorkspaces.columns.status')}</span>,
      cell: ({ row }) => {
        const deleteAt = row.original.deleteAt;
        const status = row.original.status;

        if (status === 'deleted') {
          return <BadgeStatus variant="red">{t('userWorkspaces.status.deleted')}</BadgeStatus>
        }

        if (deleteAt) {
          return <BadgeStatus variant="red">{t('userWorkspaces.status.deletionPending')}</BadgeStatus>
        }

        return <BadgeStatus variant="green">{t('userWorkspaces.status.active')}</BadgeStatus>
      },
    },
    {
      id: 'plan',
      header: ({column}) => (
        <CollectionColumnHeader column={column} title={t('userWorkspaces.columns.plan')} />
      ),
      cell: ({row}) => {
        const subscription = row.original.subscription;
        const planName = subscription
          ? (subscription.productGroup?.name ?? t('userWorkspaces.plan.paid'))
          : t('userWorkspaces.plan.free');
        const isPro = subscription !== null;

        // The subscribed product(s) and price(s), when the page requested
        // subscription items.
        const productLabels = [
          ...new Set(
            (subscription?.items ?? [])
              .map((item) => {
                const productName = item.price?.product?.name;
                const priceName = item.price?.nickname;
                if (productName && priceName) return `${productName} — ${priceName}`;
                return productName ?? priceName ?? '';
              })
              .filter((label) => label !== ''),
          ),
        ];

        return (
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              {isPro ? (
                <div className="inline-block"><PlanBadge label={planName} /></div>
              ) : (
                <Badge variant="secondary">{planName}</Badge>
              )}
            </div>
            {productLabels.length > 0 && (
              <span className="text-xs text-muted-foreground truncate">
                {productLabels.join(', ')}
              </span>
            )}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions')}</div>,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-1">
            <CollectionRowActions
              row={row}
              actions={[
                {
                  label: t('userWorkspaces.actions.manage'),
                  icon: Settings,
                  onClick: (organization: Organization) => {
                    onManageWorkspace?.(organization);
                  },
                },
                {
                  label: t('common.rename'),
                  icon: Pen,
                  onClick: (organization: Organization) => {
                    onRenameWorkspace?.(organization);
                  },
                },
                {
                  label: t('userWorkspaces.actions.delete'),
                  icon: Trash,
                  group: 'danger',
                  className: 'text-red-500!',
                  onClick: (organization: Organization) => {
                    onDeleteWorkspace?.(organization);
                  },
                },
              ]}
            />
          </div>
        );
      },
    },
  ];
}
