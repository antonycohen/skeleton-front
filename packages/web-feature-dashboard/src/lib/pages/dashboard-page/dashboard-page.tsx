import {useCurrentWorkspaceUrlPrefix, useGetCurrentWorkspaceId} from '@skeleton/core-workspace';
import {useCancelOrganizationDeletion, useGetOrganizationById} from '@skeleton/core-api';
import {MetricCard} from '@skeleton/web-components';
import {toast} from 'sonner';
import {LayoutTopbar, useBreadcrumb} from '@skeleton/web-layout';
import {useConnectedUser} from '@skeleton/core-store-session';
import {DashboardHeader} from './components/dashboard-header';
import {DeletionAlert} from './components/deletion-alert';
import {WelcomeBanner} from './components/welcome-banner';
import {useTranslation} from '@skeleton/core-translations';

export function DashboardPage() {
  const {t} = useTranslation();
  const workspaceId = useGetCurrentWorkspaceId();
  const workspaceBaseUrl = useCurrentWorkspaceUrlPrefix();
  const connectedUser = useConnectedUser();

  const cancelDeletion = useCancelOrganizationDeletion({
    onSuccess: () => toast.success(t('dashboard.deletionCancelled')),
    onError: () => toast.error(t('dashboard.deletionCancelFailed')),
  });

  const {data: organization} = useGetOrganizationById(
    {
      id: workspaceId ?? '',
      fields: {
        deleteAt: null,
        statistics: {
          fields: {
            activeMembersCount: null,
          }
        }
      }
    },
    {
      enabled: !!workspaceId,
    }
  );

  const statistics = organization?.statistics;

  const breadcrumbs = useBreadcrumb([{ label: t('dashboard.title') }]);

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar breadcrumbs={breadcrumbs} />
      </header>
      <div>
        <div className="flex flex-col gap-12 px-8 pt-8 pb-12 max-w-7xl mx-auto">
          <DashboardHeader />

          {organization?.deleteAt && (
            <DeletionAlert
              deleteAt={organization.deleteAt}
              isPending={cancelDeletion.isPending}
              onCancelDeletion={() => cancelDeletion.mutate({organizationId: workspaceId!})}
            />
          )}

          <WelcomeBanner
            firstName={connectedUser?.firstName}
            workspaceBaseUrl={workspaceBaseUrl}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              headerText={t('dashboard.members')}
              statisticText={String(statistics?.activeMembersCount ?? 0)}
              variant={(statistics?.activeMembersCount ?? 0) === 0 ? 'empty' : 'default'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
