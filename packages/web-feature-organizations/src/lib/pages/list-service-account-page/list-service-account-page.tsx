import { useState } from 'react';
import { Collection } from '@skeleton/web-collection';
import { useServiceAccountListColumns } from './hooks/use-service-account-list-columns';
import { useGetServiceAccounts } from '@skeleton/core-api';
import { LayoutContent, LayoutHeader, LayoutTopbar } from '@skeleton/web-layout';
import { useGetCurrentWorkspaceId } from '@skeleton/core-workspace';
import { ServiceAccount } from '@skeleton/core-api-models';
import { Button } from '@skeleton/web-components';
import { Plus } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';
import { CreateServiceAccountModal } from './modals/create-service-account-modal';
import { EditServiceAccountModal } from './modals/edit-service-account-modal';
import { RotateServiceAccountSecretModal } from './modals/rotate-service-account-secret-modal';
import { DisableServiceAccountModal } from './modals/disable-service-account-modal';
import { EnableServiceAccountModal } from './modals/enable-service-account-modal';
import { DeleteServiceAccountModal } from './modals/delete-service-account-modal';

export function ListServiceAccountPage() {
  const { t } = useTranslation();
  const organizationId = useGetCurrentWorkspaceId();
  const [createOpen, setCreateOpen] = useState(false);
  const [editServiceAccount, setEditServiceAccount] = useState<ServiceAccount | null>(null);
  const [rotateServiceAccount, setRotateServiceAccount] = useState<ServiceAccount | null>(null);
  const [disableServiceAccount, setDisableServiceAccount] = useState<ServiceAccount | null>(null);
  const [enableServiceAccount, setEnableServiceAccount] = useState<ServiceAccount | null>(null);
  const [deleteServiceAccount, setDeleteServiceAccount] = useState<ServiceAccount | null>(null);

  const columns = useServiceAccountListColumns({
    onEdit: (serviceAccount) => setEditServiceAccount(serviceAccount),
    onRotateSecret: (serviceAccount) => setRotateServiceAccount(serviceAccount),
    onDisable: (serviceAccount) => setDisableServiceAccount(serviceAccount),
    onEnable: (serviceAccount) => setEnableServiceAccount(serviceAccount),
    onDelete: (serviceAccount) => setDeleteServiceAccount(serviceAccount),
  });

  if (!organizationId) {
    return <div>{t('serviceAccounts.noWorkspace')}</div>;
  }

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar />
      </header>
      <LayoutContent>
        <LayoutHeader
          pageTitle={t('serviceAccounts.title')}
          pageDescription={t('serviceAccounts.description')}
        />
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              {t('serviceAccounts.createAction')}
            </Button>
          </div>

          <Collection
            useLocationAsState
            columns={columns}
            useQueryFn={useGetServiceAccounts}
            staticParams={{ organizationId }}
            queryFields={{
              id: null,
              name: null,
              clientId: null,
              permissions: null,
              status: null,
              createdAt: null,
            }}
            emptyState={t('serviceAccounts.empty')}
          />
        </div>
      </LayoutContent>

      <CreateServiceAccountModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        organizationId={organizationId}
      />

      {editServiceAccount && (
        <EditServiceAccountModal
          open={!!editServiceAccount}
          onOpenChange={(open) => !open && setEditServiceAccount(null)}
          organizationId={organizationId}
          serviceAccount={editServiceAccount}
        />
      )}

      {rotateServiceAccount && (
        <RotateServiceAccountSecretModal
          open={!!rotateServiceAccount}
          onOpenChange={(open) => !open && setRotateServiceAccount(null)}
          organizationId={organizationId}
          serviceAccount={rotateServiceAccount}
        />
      )}

      {disableServiceAccount && (
        <DisableServiceAccountModal
          open={!!disableServiceAccount}
          onOpenChange={(open) => !open && setDisableServiceAccount(null)}
          organizationId={organizationId}
          serviceAccount={disableServiceAccount}
        />
      )}

      {enableServiceAccount && (
        <EnableServiceAccountModal
          open={!!enableServiceAccount}
          onOpenChange={(open) => !open && setEnableServiceAccount(null)}
          organizationId={organizationId}
          serviceAccount={enableServiceAccount}
        />
      )}

      {deleteServiceAccount && (
        <DeleteServiceAccountModal
          open={!!deleteServiceAccount}
          onOpenChange={(open) => !open && setDeleteServiceAccount(null)}
          organizationId={organizationId}
          serviceAccount={deleteServiceAccount}
        />
      )}
    </div>
  );
}
