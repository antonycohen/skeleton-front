import {Collection} from '@skeleton/web-collection';
import {useUsersListColumns} from './hooks/use-users-list-columns';
import {useGetUsers} from '@skeleton/core-api';
import {LayoutContent, LayoutHeader, LayoutTopbar, useBreadcrumb,} from '@skeleton/web-layout';
import {useStaticAssetsUrl} from "@skeleton/core-utils";
import {useTranslation} from "@skeleton/core-translations";

export function UsersListManagerPage() {
  const columns = useUsersListColumns();
  const assetsUrl = useStaticAssetsUrl();
  const {t} = useTranslation();
  const breadcrumbs = useBreadcrumb([
    { label: t('adminUsers.breadcrumb.home'), to: '/' },
    { label: t('adminUsers.breadcrumb.users'), to: '/users' }
  ], true);

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar
          breadcrumbs={breadcrumbs}
        />
      </header>
      <LayoutContent>
        <div className="flex w-full justify-between items-end">
          <LayoutHeader
            pageTitle={t('adminUsers.list.title')}
            pageDescription={t('adminUsers.list.description')}
          />
          <img
            src={`${assetsUrl}/header-illustration.svg`}
            alt=""
            className="h-[120px] w-[360px] shrink-0 object-cover pointer-events-none"
          />
        </div>
        <Collection
          useLocationAsState
          columns={columns}
          filtersConfiguration={{
            textFilter: {
              placeholder: t('adminUsers.list.searchPlaceholder'),
              queryParamName: 'term',
            }
          }}
          useQueryFn={useGetUsers}
          queryFields={{
            id: null,
            firstName: null,
            lastName: null,
            email: null,
            status: null,
            profileImage: null,
            socialIdentifiers: null,
            createdAt: null,
          }}
        />
      </LayoutContent>
    </div>
  );
}
