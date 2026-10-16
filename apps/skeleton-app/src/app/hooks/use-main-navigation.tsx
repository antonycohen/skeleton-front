import {House, SparklesIcon} from 'lucide-react';
import {useTranslation} from '@skeleton/core-translations';
import type {ActiveNavigation} from '../navigation/get-active-navigation';

export const useMainNavigation = (workspaceBaseUrl: string, active: ActiveNavigation) => {
  const {t} = useTranslation();

  return [
    {
      title: t('navigation.main.dashboard'),
      url: `${workspaceBaseUrl}/dashboard`,
      icon: House,
      isActive: active.dashboard,
    },
    {
      title: t('navigation.main.assistant'),
      url: `${workspaceBaseUrl}/assistant`,
      icon: SparklesIcon,
      isActive: active.assistant,
    },
  ];
};
