import { LayoutGridIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

export const useClientBillingNavigation = () => {
  const { t } = useTranslation();

  return [
    {
      title: t('navigation.admin.workspaces'),
      icon: LayoutGridIcon,
      url: '/workspaces',
    },
    {
      title: t('navigation.admin.users'),
      icon: UsersIcon,
      url: '/users',
    },
  ];
};
