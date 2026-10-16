import { Outlet, useParams } from 'react-router-dom';
import { TabNavLinks } from '@skeleton/web-components';
import {
  LayoutContent,
  LayoutHeader,
  LayoutTopbar,
  useBreadcrumb,
} from '@skeleton/web-layout';
import { TFunction, useTranslation } from '@skeleton/core-translations';
import { useGetOrganizationHeader } from './hooks/use-get-organization-header';

const getTabItems = (organizationId: string, t: TFunction) => [
  {
    title: t('adminOrganizations.tabs.overview'),
    url: `/workspaces/${organizationId}/overview`,
  },
  {
    title: t('adminOrganizations.tabs.profile'),
    url: `/workspaces/${organizationId}/profile`,
  },
  {
    title: t('adminOrganizations.tabs.members'),
    url: `/workspaces/${organizationId}/members`,
  },
  {
    title: t('adminOrganizations.tabs.subscriptions'),
    url: `/workspaces/${organizationId}/subscriptions`,
  },
  {
    title: t('adminOrganizations.tabs.quotas'),
    url: `/workspaces/${organizationId}/quotas`,
  },
  {
    title: t('adminOrganizations.tabs.quotaTransactions'),
    url: `/workspaces/${organizationId}/quota-transactions`,
    // Stays active on `/quota-transactions/:quotaId` (scoped to one quota).
    matchNested: true,
  },
];

export function OrganizationEditManagerPage() {
  const { t } = useTranslation();
  const { organizationId = '' } = useParams<{ organizationId: string }>();
  const { organization } = useGetOrganizationHeader(organizationId);

  const displayName = organization?.name ?? t('adminOrganizations.detail.fallbackTitle');

  const breadcrumbs = useBreadcrumb(
    [
      { label: t('adminOrganizations.breadcrumb.home'), to: '/' },
      { label: t('adminOrganizations.breadcrumb.workspaces'), to: '/workspaces' },
      {
        label: displayName,
        to: `/workspaces/${organizationId}`,
      },
    ],
    true,
  );

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar breadcrumbs={breadcrumbs} />
      </header>
      <LayoutContent>
        <LayoutHeader pageTitle={displayName} />
        <TabNavLinks items={getTabItems(organizationId, t)} />
        {/*
          No max-width here: over half these tabs are Collections whose columns
          need the full page. Tabs that read better narrow (cards, forms) set
          their own.
        */}
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </LayoutContent>
    </div>
  );
}
