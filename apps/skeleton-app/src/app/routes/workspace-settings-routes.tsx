import {Navigate, Route, Routes} from 'react-router-dom';
import {UserLayout} from '@skeleton/web-layout';
import {User} from '@skeleton/core-api-models';
import {useConnectedUser} from "@skeleton/core-store-session";
import {useWorkspaceSettingsNavigation} from "../hooks/use-workspace-settings-navigation";
import {AccountRoutes} from "@skeleton/web-feature-users";
import {TeamsRoutes, SecurityRoutes, ServiceAccountsRoutes} from "@skeleton/web-feature-organizations";
import {BillingRoutes, CheckoutSucceedModal, PastDueInvoiceBanner, PaywallProRequiredModal} from "@skeleton/web-feature-payment";
import {useUserNavigation} from "../hooks/use-user-navigation";
import {useTranslation} from "@skeleton/core-translations";

export const WorkspaceSettingsRoutes = ({
  baseWorkspaceUrl,
}: {
  baseWorkspaceUrl: string;
  }) => {

  const {t} = useTranslation();
  const connectedUser = useConnectedUser() as User;
  const workspaceSettingsNavigation = useWorkspaceSettingsNavigation(baseWorkspaceUrl);

  const settingsBaseUrl = `${baseWorkspaceUrl}/settings`;
  const userNavigation = useUserNavigation(`${baseWorkspaceUrl}`, '/settings');

  return (
    <Routes>
      <Route
        element={
          <div>
            <UserLayout
              banner={<PastDueInvoiceBanner />}
              backLink={`${baseWorkspaceUrl}/dashboard`}
              connectedUser={connectedUser}
              navUserItems={userNavigation}
              mainNavigationGroups={[
                { sectionName: t('navigation.settings.section'), items: workspaceSettingsNavigation },
              ]}
              version={__APP_VERSION__}
            />
            <PaywallProRequiredModal />
            <CheckoutSucceedModal />
          </div>
        }
      >
        <Route path="teams" element={<TeamsRoutes />} />
        <Route path="security" element={<SecurityRoutes />} />
        <Route path="service-accounts" element={<ServiceAccountsRoutes />} />
        <Route path="billing/*" element={<BillingRoutes />} />
        <Route path="account/*" element={<AccountRoutes baseUrl={`${baseWorkspaceUrl}/settings`}/>} />
        <Route path="*" element={<Navigate to={`${settingsBaseUrl}/teams`} replace />} />
      </Route>
    </Routes>
  );
};
