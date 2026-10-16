import { BookOpenIcon, LifeBuoyIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

export const useSupportNavigation = () => {
  const { t } = useTranslation();

  return [
    {
      title: t('navigation.support.documentation'),
      icon: BookOpenIcon,
      url: import.meta.env['VITE_DOCUMENTATION_URL'] || 'https://example.com/docs',
      target: '_tab',
    },
    {
      title: t('navigation.support.messageSupport'),
      icon: LifeBuoyIcon,
      url: `mailto:${import.meta.env['VITE_SUPPORT_EMAIL'] || 'support@example.com'}`,
      target: '_tab',
    },
  ];
};
