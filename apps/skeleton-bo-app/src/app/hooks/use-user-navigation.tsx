import { LogOutIcon } from 'lucide-react';
import { NavItem } from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';

export const useUserNavigation = (): NavItem[] => {
  const { t } = useTranslation();

  return [
    { type: 'link', title: t('navigation.user.signOut'), to: '/logout', icon: <LogOutIcon /> },
  ];
};
