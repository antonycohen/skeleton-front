import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Collection } from '@skeleton/web-collection';
import { useGetOrganizationById, useGetSubscriptions } from '@skeleton/core-api';
import { Button } from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';
import { useOrganizationSubscriptionsColumns } from './hooks/use-organization-subscriptions-columns';
import { CreateSubscriptionManagerModal } from './modals/create-subscription-manager-modal';

export const OrganizationSubscriptionsTab = () => {
  const { t } = useTranslation();
  const { organizationId = '' } = useParams<{ organizationId: string }>();
  const columns = useOrganizationSubscriptionsColumns();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: organization } = useGetOrganizationById({
    id: organizationId,
    fields: { id: null, name: null, type: null },
  });

  return (
    <>
      <Collection
        useLocationAsState
        defaultSorting={[{ id: 'createdAt', desc: true }]}
        columns={columns}
        toolbarActions={
          // Workspaces without self-serve checkout are billed by invoice from here.
          [
            <Button
              key="create-subscription"
              onClick={() => setCreateModalOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {t('adminOrganizations.subscriptions.createAction')}
            </Button>,
          ]
        }
        useQueryFn={useGetSubscriptions}
        staticParams={{ organizationId }}
        queryFields={{
          id: null,
          status: null,
          description: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: null,
          trialEnd: null,
          createdAt: null,
          productGroup: {
            fields: {
              id: null,
              name: null,
            },
          },
          items: {
            fields: {
              id: null,
              price: {
                fields: {
                  id: null,
                  nickname: null,
                  product: { fields: { id: null, name: null } },
                },
              },
            },
          },
        }}
      />

      {/* Mounted on demand so the price form picks up the loaded organization type. */}
      {createModalOpen && (
        <CreateSubscriptionManagerModal
          organizationId={organizationId}
          organizationName={organization?.name}
          organizationType={organization?.type}
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      )}
    </>
  );
};
