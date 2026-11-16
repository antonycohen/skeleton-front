import { ServiceAccount, toShortPermission } from '@skeleton/core-api-models';
import {
  BadgeStatus,
  CopyButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@skeleton/web-components';
import {
  CollectionColumnHeader,
  CollectionRowActions,
  type CollectionColumnDef,
} from '@skeleton/web-collection';
import { format } from 'date-fns';
import { IconBan, IconCircleCheck } from '@tabler/icons-react';
import { Pencil, RefreshCw, Trash } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

type UseServiceAccountListColumnsOptions = {
  onEdit?: (serviceAccount: ServiceAccount) => void;
  onRotateSecret?: (serviceAccount: ServiceAccount) => void;
  onDisable?: (serviceAccount: ServiceAccount) => void;
  onEnable?: (serviceAccount: ServiceAccount) => void;
  onDelete?: (serviceAccount: ServiceAccount) => void;
};

export function useServiceAccountListColumns(
  options: UseServiceAccountListColumnsOptions,
): CollectionColumnDef<ServiceAccount>[] {
  const { onEdit, onRotateSecret, onDisable, onEnable, onDelete } = options;
  const { t } = useTranslation();

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('serviceAccounts.columns.name')} />
      ),
      cell: ({ row }) => (
        <span className="body">{row.original.name ?? '-'}</span>
      ),
      meta: { className: 'min-w-[200px]' },
      enableSorting: true,
    },
    {
      accessorKey: 'clientId',
      header: () => <span>{t('serviceAccounts.clientId')}</span>,
      cell: ({ row }) => {
        const clientId = row.original.clientId;
        if (!clientId) return <span>-</span>;
        return (
          <div className="flex items-center gap-1">
            <code className="code">{clientId}</code>
            <CopyButton
              value={clientId}
              toastMessage={t('serviceAccounts.clientIdCopied')}
              className="size-6"
            />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'permissions',
      header: () => <span>{t('serviceAccounts.columns.permissions')}</span>,
      cell: ({ row }) => {
        const permissions = row.original.permissions;
        if (!permissions?.length) return <span>-</span>;
        return (
          <Tooltip>
            {/* The count alone, under its column's title; the permissions on hover. */}
            <TooltipTrigger asChild>
              <span tabIndex={0} className="cursor-default">
                {permissions.length}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-h-64 overflow-y-auto border border-border bg-popover text-popover-foreground shadow-md">
              <div className="flex flex-col gap-0.5">
                {permissions.map((permission) => (
                  <span key={permission} className="code">
                    {toShortPermission(permission)}
                  </span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('serviceAccounts.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'active') return <BadgeStatus variant="green">{t('serviceAccounts.status.active')}</BadgeStatus>;
        if (status === 'disabled') return <BadgeStatus variant="yellow">{t('serviceAccounts.status.disabled')}</BadgeStatus>;
        if (status === 'deleted') return <BadgeStatus variant="red">{t('serviceAccounts.status.deleted')}</BadgeStatus>;
        return <span>-</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('serviceAccounts.columns.created')} />
      ),
      cell: ({ row }) => (
        <div className="body">
          {row.getValue('createdAt')
            ? format(row.getValue('createdAt'), 'dd/MM/yyyy')
            : '-'}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions')}</div>,
      cell: ({ row }) => {
        const isDisabled = row.original.status === 'disabled';

        return (
          <div className="flex items-center justify-end gap-1">
            <CollectionRowActions
              row={row}
              actions={[
                {
                  label: t('common.edit'),
                  icon: Pencil,
                  onClick: (serviceAccount: ServiceAccount) => {
                    onEdit?.(serviceAccount);
                  },
                },
                {
                  label: t('serviceAccounts.rotate.action'),
                  icon: RefreshCw,
                  onClick: (serviceAccount: ServiceAccount) => {
                    onRotateSecret?.(serviceAccount);
                  },
                },
                isDisabled
                  ? {
                      label: t('serviceAccounts.enable.action'),
                      icon: IconCircleCheck,
                      onClick: (serviceAccount: ServiceAccount) => {
                        onEnable?.(serviceAccount);
                      },
                    }
                  : {
                      label: t('serviceAccounts.disable.action'),
                      icon: IconBan,
                      onClick: (serviceAccount: ServiceAccount) => {
                        onDisable?.(serviceAccount);
                      },
                    },
                {
                  label: t('common.delete'),
                  icon: Trash,
                  group: 'danger',
                  variant: 'destructive',
                  onClick: (serviceAccount: ServiceAccount) => {
                    onDelete?.(serviceAccount);
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
