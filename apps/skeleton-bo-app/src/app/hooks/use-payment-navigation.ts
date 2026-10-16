import { TagIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

export const usePaymentNavigation = () => {
  const { t } = useTranslation();

  return [
    {
      title: t('navigation.admin.productGroups'),
      icon: TagIcon,
      url: '/payment/product-groups',
    },
  ];
};
