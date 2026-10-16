import {Navigate, Route, Routes} from 'react-router-dom';
import {useConnectedUser} from '@skeleton/core-store-session';
import {JobAlertProvider, UserLayout} from '@skeleton/web-layout';
import {AdminDashboardRoutes} from '@skeleton/web-feature-dashboard';
import {AdminUsersRoutes} from '@skeleton/web-feature-users';
import {AdminOrganizationsRoutes} from '@skeleton/web-feature-organizations';
import {useClientBillingNavigation} from "../hooks/use-client-billing-navigation";
import {useUserNavigation} from "../hooks/use-user-navigation";
import {AdminProductGroupsRoutes} from "@skeleton/web-feature-payment";
import {usePaymentNavigation} from "../hooks/use-payment-navigation";
import {useSyncLanguage, useTranslation} from "@skeleton/core-translations";

export const ProtectedRoutes = () => {
  const connectedUser = useConnectedUser();
  const {t} = useTranslation();
  const userNavigation = useUserNavigation();
  const clientBillingNavigation = useClientBillingNavigation();
  const paymentNavigation = usePaymentNavigation();
  // The UI follows the language saved in the user's preferences.
  useSyncLanguage(connectedUser?.localizationPreferences?.language);

  if (!connectedUser) {
    return null;
  }
  // JobAlertProvider wraps every route: a page can hand a background job to
  // the floating widget and navigate away.
  return (
    <JobAlertProvider>
    <Routes>
      <Route
        element={
          <UserLayout
            connectedUser={connectedUser}
            navUserItems={userNavigation}
            mainNavigationGroups={[
              {
                items: [
                  {
                    title: t('navigation.main.dashboard'),
                    url: `/dashboard`,
                  }
                ]
              },
              {
                sectionName: t('navigation.admin.clientsBilling'),
                items: clientBillingNavigation
              },
              {
                sectionName: t('navigation.admin.payment'),
                items: paymentNavigation
              },
            ]}
          />
        }
      >
        <Route path="dashboard/*" element={<AdminDashboardRoutes />} />
        <Route path="workspaces/*" element={<AdminOrganizationsRoutes />} />
        <Route path="users/*" element={<AdminUsersRoutes />} />
        <Route path="payment/product-groups/*" element={<AdminProductGroupsRoutes />} />
        <Route path="*" element={<Navigate to={'/dashboard'} />} />
      </Route>
    </Routes>
    </JobAlertProvider>
  );
};
