import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Collection} from '@skeleton/web-collection';
import {useUserOrganizationsColumns} from './hooks/use-user-organizations-columns';
import {useGetUserOrganizations} from '@skeleton/core-api';
import {LayoutContent, LayoutHeader, LayoutTopbar} from '@skeleton/web-layout';
import {useConnectedUser} from '@skeleton/core-store-session';
import {Organization, User} from '@skeleton/core-api-models';
import {UpdateOrganizationModal} from './modals/update-organization-modal';
import {DeleteOrganizationModal} from './modals/delete-organization-modal';
import {CreateUserOrganizationModal} from '../../modals/create-user-organization-modal';
import {Button} from "@skeleton/web-components";
import {Plus} from "lucide-react";
import {useTranslation} from '@skeleton/core-translations';

export function ListUserOrganizationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const connectedUser = useConnectedUser() as User;
  const userId = connectedUser?.id;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  const columns = useUserOrganizationsColumns({
    onManageWorkspace: (organization: Organization) => {
      if (organization.id) {
        navigate(`/w/${organization.id}/settings`);
      }
    },
    onRenameWorkspace: (organization: Organization) => {
      setSelectedOrganization(organization);
      setRenameModalOpen(true);
    },
    onDeleteWorkspace: (organization: Organization) => {
      setSelectedOrganization(organization);
      setDeleteModalOpen(true);
    },
  });

  if (!userId) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar />
      </header>
      <LayoutContent>
        <LayoutHeader
          pageTitle={t('userWorkspaces.title')}
          pageDescription={t('userWorkspaces.description')}
        />
        <div className="flex flex-col gap-6">
          <Collection
            useLocationAsState
            columns={columns}
            filtersConfiguration={{
              textFilter: {
                placeholder: t('userWorkspaces.searchPlaceholder'),
                queryParamName: 'term',
              }
            }}
            toolbarActions={[
              <Button key='create-workspace' onClick={() => setCreateModalOpen(true)} className="cursor-pointer">
                <Plus className="h-4 w-4" />
                {t('userWorkspaces.createAction')}
              </Button>
            ]}
            useQueryFn={useGetUserOrganizations}
            staticParams={{ userId }}
            queryFields={{
              id: null,
              name: null,
              type: null,
              createdAt: null,
              updatedAt: null,
              deleteAt: null,
              status: null,
              subscription: null,
              statistics: {
                fields: {
                  activeMembersCount: null,
                }
              }
            }}
          />
        </div>
      </LayoutContent>

      <CreateUserOrganizationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        userId={userId}
      />

      {selectedOrganization && (
        <>
          <UpdateOrganizationModal
            open={renameModalOpen}
            onOpenChange={setRenameModalOpen}
            organization={selectedOrganization}
          />
          <DeleteOrganizationModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            organization={selectedOrganization}
          />
        </>
      )}
    </div>
  );
}
