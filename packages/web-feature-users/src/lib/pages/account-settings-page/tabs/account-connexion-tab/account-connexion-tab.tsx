import {useOutletContext} from 'react-router-dom';
import {useTranslation} from '@skeleton/core-translations';
import {EditUserOutletContext} from '../../types';
import {SsoConnectSection} from "./components/sso-connect-section";
import {ChangeEmailSection} from "./components/change-email-section";
import {ChangePasswordSection} from "./components/change-password-section";
import {TwoFactorSection} from "./components/two-factor-section";

export const AccountConnexionTab = () => {
  const { user, isLoading } = useOutletContext<EditUserOutletContext>();
  const { t } = useTranslation();

  if (isLoading || !user) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <SsoConnectSection user={user} />
      <ChangeEmailSection user={user} />
      <ChangePasswordSection user={user} />
      <TwoFactorSection user={user} />
    </div>
  );
};
