import { useParams } from 'react-router-dom';
import { useGetOrganizationById } from '@skeleton/core-api';
import { MetricCard, Skeleton } from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';

export const OrganizationOverviewTab = () => {
  const { t } = useTranslation();
  const { organizationId = '' } = useParams<{ organizationId: string }>();

  const { data: organization, isLoading } = useGetOrganizationById(
    {
      id: organizationId,
      fields: {
        statistics: {
          fields: {
            activeMembersCount: null,
          },
        },
      },
    },
    {
      enabled: !!organizationId,
    },
  );

  const statistics = organization?.statistics;

  if (isLoading) {
    return (
      <div className="flex max-w-4xl flex-col gap-6 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6 py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          headerText={t('adminOrganizations.overview.members')}
          statisticText={String(statistics?.activeMembersCount ?? 0)}
          variant={
            (statistics?.activeMembersCount ?? 0) === 0 ? 'empty' : 'default'
          }
        />
      </div>
    </div>
  );
};
