import { ColumnDef } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { ReadQuota } from '@skeleton/core-api-models';
import { Badge, BadgeStatus, Progress } from '@skeleton/web-components';
import {
  CollectionColumnHeader,
  CollectionRowActions,
} from '@skeleton/web-collection';
import { IconPencil, IconReceipt } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';
import { getFeatureLabel } from '../quota-feature-label';
import { AdjustQuotaModal } from '../modals/adjust-quota-modal';

const getUsageRatio = (current: number | null, limit: number | null) => {
  if (current === null || limit === null || limit <= 0) return null;
  return Math.min(100, Math.round((current / limit) * 100));
};

/**
 * The API reports the lifecycle status, but an `active` quota may still be
 * waiting for its period to open, so the window refines that one case into
 * `scheduled`. Every other status is reported as-is.
 */
const getDisplayStatus = (quota: ReadQuota) => {
  if (quota.status && quota.status !== 'active') return quota.status;

  const start = quota.periodStart ? new Date(quota.periodStart).getTime() : null;
  const end = quota.periodEnd ? new Date(quota.periodEnd).getTime() : null;
  if (quota.status === null && start === null && end === null) return null;

  const now = Date.now();
  if (start !== null && now < start) return 'scheduled' as const;
  if (end !== null && now > end) return 'expired' as const;
  return 'active' as const;
};

/**
 * The adjust endpoint does not take a quota id: it re-resolves the quota from
 * owner + feature key with `period_start <= now AND period_end > now AND status
 * = ACTIVE`. On any other row the write would land on a different quota, or 404.
 * So the action is offered only where the row *is* that quota — mirroring the
 * backend predicate exactly. The clock here is the client's, which is fine for an
 * affordance; the backend still validates.
 */
const isAdjustable = (quota: ReadQuota) => {
  if (quota.status !== 'active') return false;
  if (!quota.periodStart || !quota.periodEnd) return false;

  const now = Date.now();
  return (
    new Date(quota.periodStart).getTime() <= now &&
    new Date(quota.periodEnd).getTime() > now
  );
};

const formatPeriod = (
  start: string | null | undefined,
  end: string | null | undefined,
) => {
  if (!start && !end) return '-';
  const fmt = (v?: string | null) =>
    v ? format(new Date(v), 'dd/MM/yyyy') : '?';
  return `${fmt(start)} → ${fmt(end)}`;
};

export function useOrganizationQuotasColumns(): ColumnDef<ReadQuota>[] {
  const { t } = useTranslation();
  const { organizationId = '' } = useParams<{ organizationId: string }>();

  return [
    {
      id: 'feature',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotas.columns.feature')} />
      ),
      cell: ({ row }) => {
        const quota = row.original;
        const label = getFeatureLabel(quota);
        const showRawKey = quota.featureKey && quota.feature?.displayName;
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{label}</span>
            {showRawKey ? (
              <span className="text-xs text-muted-foreground">
                {quota.featureKey}
              </span>
            ) : null}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'aggregationType',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotas.columns.aggregation')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('aggregationType') as string | null;
        return value ? (
          <Badge variant="outline" className="capitalize">
            {value.toLowerCase().replace(/_/g, ' ')}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      filterFn: 'equals',
      enableSorting: false,
    },
    {
      // Sorted on the end date: what matters is when a quota runs out, not when it opened.
      accessorKey: 'periodEnd',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotas.columns.period')} />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatPeriod(row.original.periodStart, row.original.periodEnd)}
        </span>
      ),
    },
    {
      id: 'periodStatus',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotas.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = getDisplayStatus(row.original);
        if (status === 'active')
          return <BadgeStatus variant="green">{t('adminOrganizations.quotas.status.active')}</BadgeStatus>;
        if (status === 'scheduled')
          return <BadgeStatus variant="blue">{t('adminOrganizations.quotas.status.scheduled')}</BadgeStatus>;
        if (status === 'expired')
          return <BadgeStatus variant="red">{t('adminOrganizations.quotas.status.expired')}</BadgeStatus>;
        if (status === 'superseded')
          return <BadgeStatus variant="yellow">{t('adminOrganizations.quotas.status.superseded')}</BadgeStatus>;
        if (status === 'cancelled')
          return <BadgeStatus variant="red">{t('adminOrganizations.quotas.status.cancelled')}</BadgeStatus>;
        return <span className="text-muted-foreground">-</span>;
      },
      enableSorting: false,
    },
    {
      id: 'usage',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotas.columns.usage')} />
      ),
      cell: ({ row }) => {
        const quota = row.original;
        const ratio = getUsageRatio(quota.currentUsage, quota.quotaLimit);
        const usageOver =
          quota.quotaLimit !== null &&
          quota.currentUsage !== null &&
          quota.currentUsage > quota.quotaLimit;
        return (
          <div className="flex flex-col gap-1 min-w-[160px]">
            <span className="text-sm tabular-nums">
              {quota.currentUsage ?? 0} / {quota.quotaLimit ?? '∞'}
            </span>
            {ratio !== null ? (
              <Progress
                value={ratio}
                className={usageOver ? '[&>div]:bg-destructive' : ''}
              />
            ) : null}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'remainingQuota',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotas.columns.remaining')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('remainingQuota') as number | null;
        return (
          <div className="text-right tabular-nums">{value ?? '-'}</div>
        );
      },
      meta: { className: 'text-right' },
      enableSorting: false,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotas.columns.updated')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('updatedAt') as string | null;
        return (
          <div className="text-muted-foreground">
            {value ? format(new Date(value), 'dd/MM/yyyy') : '-'}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions')}</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <CollectionRowActions
            row={row}
            actions={[
              ...(isAdjustable(row.original)
                ? [
                    {
                      label: t('adminOrganizations.quotas.adjustAction'),
                      icon: IconPencil,
                      dialog: {
                        id: 'adjust-quota',
                        component: AdjustQuotaModal,
                      },
                    },
                  ]
                : []),
              {
                label: t('adminOrganizations.quotas.viewTransactions'),
                icon: IconReceipt,
                linkTo: (quota: ReadQuota) =>
                  `/workspaces/${organizationId}/quota-transactions/${quota.id}`,
              },
            ]}
          />
        </div>
      ),
      size: 80,
    },
  ];
}
