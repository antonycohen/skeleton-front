import { Navigate, Route, Routes } from 'react-router-dom';
import { OrganizationsListManagerPage } from '../pages/list-organizations-manager-page/organizations-list-manager-page';
import { OrganizationEditManagerPage } from '../pages/edit-organization-manager-page/edit-organization-manager-page';
import { EditOrganizationProfileTab } from '../pages/edit-organization-manager-page/tabs/edit-organization-profile-tab/edit-organization-profile-tab';
import { OrganizationMembersTab } from '../pages/edit-organization-manager-page/tabs/organization-members-tab/organization-members-tab';
import { OrganizationSubscriptionsTab } from '../pages/edit-organization-manager-page/tabs/organization-subscriptions-tab/organization-subscriptions-tab';
import { OrganizationQuotasTab } from '../pages/edit-organization-manager-page/tabs/organization-quotas-tab/organization-quotas-tab';
import { OrganizationQuotaTransactionsTab } from '../pages/edit-organization-manager-page/tabs/organization-quota-transactions-tab/organization-quota-transactions-tab';
import { OrganizationOverviewTab } from '../pages/edit-organization-manager-page/tabs/organization-overview-tab/organization-overview-tab';

export const AdminOrganizationsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<OrganizationsListManagerPage />} />
      <Route
        path=":organizationId"
        element={<OrganizationEditManagerPage />}
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OrganizationOverviewTab />} />
        <Route path="profile" element={<EditOrganizationProfileTab />} />
        <Route path="members" element={<OrganizationMembersTab />} />
        <Route path="subscriptions" element={<OrganizationSubscriptionsTab />} />
        <Route path="quotas" element={<OrganizationQuotasTab />} />
        <Route
          path="quota-transactions"
          element={<OrganizationQuotaTransactionsTab />}
        />
        {/*
          Scoped to one quota, reached from the Quotas tab's "View transactions".
          A path segment rather than `?quotaId=`: the Collection's
          `useLocationAsState` rebuilds the query string from its own keys and
          would drop a foreign search param on its first sync.
        */}
        <Route
          path="quota-transactions/:quotaId"
          element={<OrganizationQuotaTransactionsTab />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
