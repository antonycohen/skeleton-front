import {
  CreditCardIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

export const useWorkspaceSettingsNavigation = (workspaceBaseUrl: string) => {
  const { t } = useTranslation();

  return [
    {
      title: t('navigation.settings.teams'),
      url: `${workspaceBaseUrl}/settings/teams`,
      icon: UserRoundIcon,
    },
    {
      title: t('navigation.settings.security'),
      url: `${workspaceBaseUrl}/settings/security`,
      icon: ShieldCheckIcon,
    },
    {
      title: t('navigation.settings.serviceAccounts'),
      url: `${workspaceBaseUrl}/settings/service-accounts`,
      icon: KeyRoundIcon,
    },
    {
      title: t('navigation.settings.billing'),
      url: `${workspaceBaseUrl}/settings/billing`,
      icon: CreditCardIcon,
    },
  ]
}
