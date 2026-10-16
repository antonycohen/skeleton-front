import { useOutletContext } from 'react-router-dom';
import { useTranslation } from '@skeleton/core-translations';
import { EditUserOutletContext } from '../../types';
import { UpdateLocalizationPreferencesSection } from './components/update-localization-preferences-section';
import { UpdateNotificationsPreferencesSection } from './components/update-notifications-preferences-section';

export const AccountPreferencesTab = () => {
  const { user, isLoading } = useOutletContext<EditUserOutletContext>();
  const { t } = useTranslation();

  if (isLoading || !user) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <UpdateLocalizationPreferencesSection user={user} />
      <UpdateNotificationsPreferencesSection user={user} />
    </div>
  );
};
