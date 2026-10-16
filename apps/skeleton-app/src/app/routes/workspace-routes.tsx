import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {UserLayout} from '@skeleton/web-layout';
import {useConnectedUser} from '@skeleton/core-store-session';
import {User} from '@skeleton/core-api-models';
import {useSupportNavigation} from '../hooks/use-support-navigation';
import {useMainNavigation} from '../hooks/use-main-navigation';
import {getActiveNavigation} from '../navigation/get-active-navigation';
import {useWorkspaceSwitcher} from '../hooks/use-workspace-switcher';
import {DashboardRoutes} from '@skeleton/web-feature-dashboard';
import {AiRoutes} from '@skeleton/web-feature-ai';
import {CheckoutSucceedModal, PastDueInvoiceBanner, PaywallProRequiredModal, SubscriptionPlanCard} from "@skeleton/web-feature-payment";
import {AccountRoutes} from "@skeleton/web-feature-users";
import {WorkspaceSettingsRoutes} from './workspace-settings-routes';
import {useUserNavigation} from "../hooks/use-user-navigation";

import {
  OrganizationDispatcherPage,
  useCreateUserOrganizationModal,
  WorkspacesRoutes,
} from "@skeleton/web-feature-organizations";
import {useGetCurrentWorkspaceId} from "@skeleton/core-workspace";
import {useTranslation} from "@skeleton/core-translations";

export const WorkspaceRoutes = () => {
  const {t} = useTranslation();
  const connectedUser = useConnectedUser() as User;
  const organizationId = useGetCurrentWorkspaceId();

  const baseWorkspaceUrl = `/w/${organizationId}`;

  const userNavigation = useUserNavigation(baseWorkspaceUrl);

  const { Modal: CreateWorkspaceModal, open: openCreateWorkspace } = useCreateUserOrganizationModal({
    userId: connectedUser.id as string,
  });

  const workspaceSwitcher = useWorkspaceSwitcher({
    userId: connectedUser.id as string,
    selectedWorkspaceId: organizationId,
    settingsUrl: `${baseWorkspaceUrl}/settings`,
    onAddWorkspace: openCreateWorkspace,
  });

  const { pathname } = useLocation();
  const activeNavigation = getActiveNavigation(pathname, baseWorkspaceUrl);
  const mainNavigation = useMainNavigation(baseWorkspaceUrl, activeNavigation);
  const supportNavigation = useSupportNavigation();

  return (
    <>
      <Routes>
        <Route path="dispatch" element={<OrganizationDispatcherPage />} />
        <Route path="settings/*" element={<WorkspaceSettingsRoutes baseWorkspaceUrl={baseWorkspaceUrl} />} />
        <Route
          element={
          <div>
            <UserLayout
              banner={<PastDueInvoiceBanner />}
              cardPlan={<SubscriptionPlanCard />}
              navUserItems={userNavigation}
              connectedUser={connectedUser}
              workspaces={workspaceSwitcher}
              mainNavigationGroups={[
                {
                  items: mainNavigation,
                },
              ]}
              footerNavigationGroups={[
                {
                  sectionName: t('navigation.support.section'),
                  items: supportNavigation,
                },
              ]}
            />
            <CreateWorkspaceModal />
          </div>
          }
        >
          <Route path="account/*" element={<AccountRoutes baseUrl={baseWorkspaceUrl} />} />
          <Route path="dashboard/*" element={<DashboardRoutes />} />
          <Route path="assistant/*" element={<AiRoutes />} />
          <Route path="workspaces/*" element={<WorkspacesRoutes />} />
          <Route path='*' element={<Navigate to={`${baseWorkspaceUrl}/dispatch`} replace />} />
        </Route>
      </Routes>
      <PaywallProRequiredModal />
      <CheckoutSucceedModal />
    </>

  );
};
