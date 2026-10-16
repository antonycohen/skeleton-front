import { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Collection } from '@skeleton/web-collection';
import { useGetQuotaTransactions, useGetQuotas } from '@skeleton/core-api';
import { Button } from '@skeleton/web-components';
import { XIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';
import { useOrganizationQuotaTransactionsColumns } from './hooks/use-organization-quota-transactions-columns';

export const OrganizationQuotaTransactionsTab = () => {
  const { tNode, t } = useTranslation();
  const { organizationId = '', quotaId } = useParams<{
    organizationId: string;
    quotaId: string;
  }>();
  const columns = useOrganizationQuotaTransactionsColumns();

  // A transaction carries no reference back to its quota, so the scoped view
  // has to name the quota from the quotas list to say what is being shown.
  const { data: quotas } = useGetQuotas(
    {
      offset: 0,
      // A workspace holds a handful of quotas (one per feature per period), so
      // a single page is enough to resolve the one named in the URL.
      limit: 100,
      staticParams: { organizationId },
      fields: {
        id: null,
        featureKey: null,
        periodStart: null,
        periodEnd: null,
        feature: { fields: { id: null, displayName: null } },
      },
    },
    { enabled: !!quotaId && !!organizationId },
  );

  const quota = quotaId
    ? quotas?.data?.find((candidate) => candidate.id === quotaId)
    : undefined;

  const quotaLabel =
    quota?.feature?.displayName?.trim() || quota?.featureKey ||
    t('adminOrganizations.quotaTransactions.thisQuota');
  const quotaPeriod =
    quota?.periodStart && quota?.periodEnd
      ? ` (${format(new Date(quota.periodStart), 'dd/MM/yyyy')} → ${format(
          new Date(quota.periodEnd),
          'dd/MM/yyyy',
        )})`
      : '';

  return (
    <div className="flex flex-col gap-4">
      {quotaId && (
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {tNode('adminOrganizations.quotaTransactions.scopedTo', {
              quota: quotaLabel,
              period: quotaPeriod,
              strong: (chunks: ReactNode) => (
                <span className="font-medium text-foreground">{chunks}</span>
              ),
            })}
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/workspaces/${organizationId}/quota-transactions`}>
              <XIcon className="size-4" />
              {t('adminOrganizations.quotaTransactions.showAll')}
            </Link>
          </Button>
        </div>
      )}
      <Collection
        useLocationAsState
        defaultSorting={[{ id: 'createdAt', desc: true }]}
        columns={columns}
        useQueryFn={useGetQuotaTransactions}
        staticParams={quotaId ? { organizationId, quotaId } : { organizationId }}
        queryFields={{
          id: null,
          amount: null,
          operationType: null,
          description: null,
          referenceType: null,
          referenceId: null,
          createdAt: null,
        }}
      />
    </div>
  );
};
