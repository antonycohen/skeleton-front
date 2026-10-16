import { useParams } from 'react-router-dom';
import { Collection } from '@skeleton/web-collection';
import { useGetQuotas } from '@skeleton/core-api';
import { useTranslation } from '@skeleton/core-translations';
import { useOrganizationQuotasColumns } from './hooks/use-organization-quotas-columns';

export const OrganizationQuotasTab = () => {
  const { t } = useTranslation();
  const { organizationId = '' } = useParams<{ organizationId: string }>();
  const columns = useOrganizationQuotasColumns();

  return (
    <Collection
      useLocationAsState
      defaultSorting={[{ id: 'periodEnd', desc: true }]}
      columns={columns}
      filtersConfiguration={{
        textFilter: {
          placeholder: t('adminOrganizations.quotas.searchPlaceholder'),
          queryParamName: 'term',
        },
      }}
      useQueryFn={useGetQuotas}
      staticParams={{ organizationId }}
      queryFields={{
        id: null,
        featureKey: null,
        aggregationType: null,
        status: null,
        periodStart: null,
        periodEnd: null,
        quotaLimit: null,
        currentUsage: null,
        remainingQuota: null,
        updatedAt: null,
        feature: {
          fields: {
            id: null,
            lookupKey: null,
            displayName: null,
          },
        },
      }}
    />
  );
};
