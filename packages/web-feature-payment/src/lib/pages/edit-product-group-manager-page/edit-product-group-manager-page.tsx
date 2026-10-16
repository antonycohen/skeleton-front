import { Outlet, useParams } from 'react-router-dom';
import { TabNavLinks } from '@skeleton/web-components';
import {
  LayoutContent,
  LayoutHeader,
  LayoutTopbar,
  useBreadcrumb,
} from '@skeleton/web-layout';
import { TFunction, useTranslation } from '@skeleton/core-translations';
import { useGetProductGroupHeader } from './hooks/use-get-product-group-header';

const getTabItems = (t: TFunction, productGroupId: string) => [
  {
    title: t('adminPayment.productGroup.tab.profile'),
    url: `/payment/product-groups/${productGroupId}/profile`,
  },
  {
    title: t('adminPayment.productGroup.tab.products'),
    url: `/payment/product-groups/${productGroupId}/products`,
  },
];

export function ProductGroupEditManagerPage() {
  const { t } = useTranslation();
  const { productGroupId = '' } = useParams<{ productGroupId: string }>();
  const { productGroup } = useGetProductGroupHeader(productGroupId);

  const displayName = productGroup?.name ?? t('adminPayment.productGroup.fallbackName');

  const breadcrumbs = useBreadcrumb(
    [
      { label: t('adminPayment.breadcrumb.home'), to: '/' },
      { label: t('adminPayment.productGroups.title'), to: '/payment/product-groups' },
      {
        label: displayName,
        to: `/payment/product-groups/${productGroupId}`,
      },
    ],
    true,
  );

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar breadcrumbs={breadcrumbs} />
      </header>
      <LayoutContent>
        <LayoutHeader pageTitle={displayName} />
        <TabNavLinks items={getTabItems(t, productGroupId)} />
        <div className="flex flex-col h-full max-w-4xl">
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </LayoutContent>
    </div>
  );
}
