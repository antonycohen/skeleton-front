import { useParams } from 'react-router-dom';
import { Collection } from '@skeleton/web-collection';
import { useGetOrganizationMembers } from '@skeleton/core-api';
import { useOrganizationMembersColumns } from './hooks/use-organization-members-columns';
import { InviteFormSection } from '../../../../components/invite-form-section';
import { useTranslation } from '@skeleton/core-translations';

export const OrganizationMembersTab = () => {
  const { t } = useTranslation();
  const { organizationId = '' } = useParams<{ organizationId: string }>();
  const columns = useOrganizationMembersColumns();

  return (
    <div className="flex flex-col gap-8">
      <InviteFormSection organizationId={organizationId} />

      <Collection
        useLocationAsState
        defaultSorting={[{ id: 'createdAt', desc: true }]}
        columns={columns}
        filtersConfiguration={{
          textFilter: {
            placeholder: t('adminOrganizations.members.searchPlaceholder'),
            queryParamName: 'term',
          },
        }}
        useQueryFn={useGetOrganizationMembers}
        staticParams={{ organizationId }}
        queryFields={{
          id: null,
          // `id` above is the membership; the user's own id lives here and is what
          // `/users/:userId` needs.
          user: {
            fields: {
              id: null,
            },
          },
          email: null,
          firstName: null,
          lastName: null,
          role: null,
          status: null,
          mfaEnabled: null,
          createdAt: null,
        }}
      />
    </div>
  );
};
