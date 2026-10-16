import { Collection } from '@skeleton/web-collection';
import { useGetProductGroups } from '@skeleton/core-api';
import {
  LayoutContent,
  LayoutHeader,
  LayoutTopbar,
  useBreadcrumb,
} from '@skeleton/web-layout';
import { useTranslation } from '@skeleton/core-translations';
import { useProductGroupsListColumns } from './hooks/use-product-groups-list-columns';

export function ProductGroupsListManagerPage() {
  const { t } = useTranslation();
  const columns = useProductGroupsListColumns();
  const breadcrumbs = useBreadcrumb(
    [
      { label: t('adminPayment.breadcrumb.home'), to: '/' },
      { label: t('adminPayment.productGroups.title'), to: '/payment/product-groups' },
    ],
    true,
  );

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar breadcrumbs={breadcrumbs} />
      </header>
      <LayoutContent>
        <LayoutHeader
          pageTitle={t('adminPayment.productGroups.title')}
          pageDescription={t('adminPayment.productGroups.description')}
        />
        <Collection
          useLocationAsState
          columns={columns}
          filtersConfiguration={{
            textFilter: {
              placeholder: t('adminPayment.productGroups.searchPlaceholder'),
              queryParamName: 'term',
            },
          }}
          useQueryFn={useGetProductGroups}
          queryFields={{
            id: null,
            name: null,
            description: null,
            active: null,
            createdAt: null,
          }}
        />
      </LayoutContent>
    </div>
  );
}
