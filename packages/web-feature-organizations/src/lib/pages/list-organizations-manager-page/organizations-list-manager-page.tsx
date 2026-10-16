import { Collection } from '@skeleton/web-collection';
import { useGetOrganizations } from '@skeleton/core-api';
import {
  LayoutContent,
  LayoutHeader,
  LayoutTopbar,
  useBreadcrumb,
} from '@skeleton/web-layout';
import { useOrganizationsListColumns } from './hooks/use-organizations-list-columns';
import { useState } from 'react';
import { Button } from '@skeleton/web-components';
import { Plus } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';
import { CreateOrganizationManagerModal } from './modals/create-organization-manager-modal';

export function OrganizationsListManagerPage() {
  const { t } = useTranslation();
  const columns = useOrganizationsListColumns();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const breadcrumbs = useBreadcrumb(
    [
      { label: t('adminOrganizations.breadcrumb.home'), to: '/' },
      { label: t('adminOrganizations.breadcrumb.workspaces'), to: '/workspaces' },
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
          pageTitle={t('adminOrganizations.list.title')}
          pageDescription={t('adminOrganizations.list.description')}
        />
        <Collection
          useLocationAsState
          columns={columns}
          filtersConfiguration={{
            textFilter: {
              placeholder: t('adminOrganizations.list.searchPlaceholder'),
              queryParamName: 'term',
            },
          }}
          toolbarActions={[
            <Button key="create-organization" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('adminOrganizations.list.createAction')}
            </Button>,
          ]}
          useQueryFn={useGetOrganizations}
          queryFields={{
            id: null,
            name: null,
            domain: null,
            type: null,
            status: null,
            ssoAvailable: null,
            ssoStatus: null,
            createdAt: null,
          }}
        />
        <CreateOrganizationManagerModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </LayoutContent>
    </div>
  );
}
