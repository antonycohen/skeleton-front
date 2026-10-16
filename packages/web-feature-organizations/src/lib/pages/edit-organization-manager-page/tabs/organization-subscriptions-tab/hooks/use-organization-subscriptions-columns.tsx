import { ColumnDef } from '@tanstack/react-table';
import { ReadSubscription } from '@skeleton/core-api-models';
import {
  Badge,
  BadgeStatus,
  LongText,
} from '@skeleton/web-components';
import { CollectionColumnHeader } from '@skeleton/web-collection';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';

const STATUS_BADGE: Record<
  string,
  { variant: 'green' | 'red' | 'yellow' | 'blue'; labelKey: string }
> = {
  active: { variant: 'green', labelKey: 'adminOrganizations.subscriptions.status.active' },
  trialing: { variant: 'blue', labelKey: 'adminOrganizations.subscriptions.status.trialing' },
  past_due: { variant: 'yellow', labelKey: 'adminOrganizations.subscriptions.status.pastDue' },
  unpaid: { variant: 'red', labelKey: 'adminOrganizations.subscriptions.status.unpaid' },
  canceled: { variant: 'red', labelKey: 'adminOrganizations.subscriptions.status.canceled' },
  paused: { variant: 'yellow', labelKey: 'adminOrganizations.subscriptions.status.paused' },
  incomplete: { variant: 'yellow', labelKey: 'adminOrganizations.subscriptions.status.incomplete' },
  incomplete_expired: { variant: 'red', labelKey: 'adminOrganizations.subscriptions.status.incompleteExpired' },
};

export function useOrganizationSubscriptionsColumns(): ColumnDef<ReadSubscription>[] {
  const { t } = useTranslation();
  return [
    {
      id: 'plan',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.subscriptions.columns.plan')} />
      ),
      cell: ({ row }) => {
        const subscription = row.original;
        const planName =
          subscription.productGroup?.name ?? subscription.description ?? '-';
        return (
          <div className="flex flex-col min-w-0">
            <LongText className="max-w-64 font-semibold">{planName}</LongText>
            {subscription.id ? (
              <span className="text-xs text-muted-foreground truncate">
                {subscription.id}
              </span>
            ) : null}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'product',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.subscriptions.columns.product')} />
      ),
      cell: ({ row }) => {
        const items = row.original.items ?? [];
        if (items.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        // One line per subscription item: the subscribed product, with the
        // price nickname as the detail line.
        return (
          <div className="flex flex-col gap-1 min-w-0">
            {items.map((item, index) => (
              <div key={item.id ?? index} className="flex flex-col min-w-0">
                <LongText className="max-w-64">
                  {item.price?.product?.name ?? item.price?.nickname ?? '-'}
                </LongText>
                {item.price?.product?.name && item.price?.nickname ? (
                  <span className="text-xs text-muted-foreground truncate">
                    {item.price.nickname}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.subscriptions.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string | null;
        const badge = status ? STATUS_BADGE[status] : undefined;
        if (badge) {
          return <BadgeStatus variant={badge.variant}>
              {t(badge.labelKey)}
            </BadgeStatus>;
        }
        return status ? (
          <Badge variant="outline" className="capitalize">
            {status.replace(/_/g, ' ')}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      filterFn: 'equals',
    },
    {
      accessorKey: 'currentPeriodEnd',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.subscriptions.columns.periodEnds')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('currentPeriodEnd') as string | null;
        const cancelAtPeriodEnd = row.original.cancelAtPeriodEnd ?? false;
        return (
          <div className="flex flex-col">
            <span>{value ? format(new Date(value), 'dd/MM/yyyy') : '-'}</span>
            {cancelAtPeriodEnd ? (
              <span className="text-xs text-destructive">
                {t('adminOrganizations.subscriptions.cancelsAtPeriodEnd')}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: 'trialEnd',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.subscriptions.columns.trialEnds')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('trialEnd') as string | null;
        return (
          <div className="text-muted-foreground">
            {value ? format(new Date(value), 'dd/MM/yyyy') : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.subscriptions.columns.created')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('createdAt') as string | null;
        return <div>{value ? format(new Date(value), 'dd/MM/yyyy') : '-'}</div>;
      },
    },
  ];
}
