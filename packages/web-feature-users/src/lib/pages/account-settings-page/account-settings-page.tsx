import {Outlet} from 'react-router-dom';
import {TabNavLinks} from '@skeleton/web-components';
import {LayoutContent, LayoutHeader, LayoutTopbar} from "@skeleton/web-layout";
import {useGetUserForAccountSettingsPage} from "./hooks/use-get-user-for-account-settings-page";
import {useConnectedUser} from "@skeleton/core-store-session";
import {EditUserOutletContext} from "./types";
import {useTranslation} from '@skeleton/core-translations';

export function AccountSettingsPage({baseUrl} : {baseUrl: string}) {
  const { t } = useTranslation();
  const tabItems = [
    { title: t('account.tabs.profile'), url: `${baseUrl}/account/profile` },
    { title: t('account.tabs.connexion'), url: `${baseUrl}/account/connexion` },
    { title: t('account.tabs.preferences'), url: `${baseUrl}/account/preferences` },
  ];
  const connectedUser = useConnectedUser();
  const connectedUserId = connectedUser?.id as string;
  const { user, isLoading } =
    useGetUserForAccountSettingsPage(connectedUserId);

  const outletContext: EditUserOutletContext = {
    user,
    isLoading,
  };

  if(!user) {
    return <div>{t('account.userNotFound')}</div>;
  }

  const displayName = user.firstName ?? t('account.myAccount');

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar />
      </header>
      <LayoutContent className={'gap-8'}>
        <LayoutHeader
          pageTitle={displayName}
        />
        <TabNavLinks items={tabItems} />
        <div className="flex flex-col h-full  max-w-4xl">
          <div className="flex-1">
            <Outlet context={outletContext} />
          </div>
        </div>
      </LayoutContent>
    </div>
  );
}
