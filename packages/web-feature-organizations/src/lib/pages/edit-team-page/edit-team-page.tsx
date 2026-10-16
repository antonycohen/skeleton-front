import { useState } from 'react';
import { Collection } from '@skeleton/web-collection';
import { useTeamMembersColumns } from './hooks/use-team-members-columns';
import { useGetOrganizationById, useGetOrganizationMembers } from '@skeleton/core-api';
import {LayoutContent, LayoutHeader, LayoutTopbar} from '@skeleton/web-layout';
import { useGetCurrentWorkspaceId } from '@skeleton/core-workspace';
import { OrganizationMember } from '@skeleton/core-api-models';
import { InviteFormSection } from '../../components/invite-form-section';
import { ChangeMemberRoleModal } from './modals/change-member-role-modal';
import { SuspendMemberModal } from './modals/suspend-member-modal';
import { UnsuspendMemberModal } from './modals/unsuspend-member-modal';
import { RemoveMemberModal } from './modals/remove-member-modal';
import { useTranslation } from '@skeleton/core-translations';

export function EditTeamPage() {
  const { t } = useTranslation();
  const organizationId = useGetCurrentWorkspaceId();
  const [changeRoleMember, setChangeRoleMember] = useState<OrganizationMember | null>(null);
  const [suspendMember, setSuspendMember] = useState<OrganizationMember | null>(null);
  const [unsuspendMember, setUnsuspendMember] = useState<OrganizationMember | null>(null);
  const [removeMember, setRemoveMember] = useState<OrganizationMember | null>(null);

  const { data: organization } = useGetOrganizationById({
    id: organizationId ?? '',
    fields: { id: null, name: null },
  });

  const columns = useTeamMembersColumns({
    organizationId: organizationId ?? '',
    onChangeRole: (member) => setChangeRoleMember(member),
    onSuspendMember: (member) => setSuspendMember(member),
    onUnsuspendMember: (member) => setUnsuspendMember(member),
    onRemoveMember: (member) => setRemoveMember(member),
  });

  if (!organizationId) {
    return <div>{t('teams.page.noOrganization')}</div>;
  }

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar />
      </header>
      <LayoutContent>
        <LayoutHeader
          pageTitle={t('teams.page.title')}
          pageDescription={
            organization?.name
              ? t('teams.page.description', { name: organization.name })
              : t('teams.page.descriptionFallback')
          }
        />
        <div className="flex flex-col gap-8 ">
          {/* Invite Section */}
          <InviteFormSection organizationId={organizationId}/>


          {/* Members Table */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold font-heading">{t('teams.members.title')}</h2>
            <Collection
              useLocationAsState
              columns={columns}
              filtersConfiguration={{
                textFilter: {
                  placeholder: t('teams.members.searchPlaceholder'),
                  queryParamName: 'term',
                },
                facetedFilters: [
                  {
                    columnId: 'role',
                    title: t('teams.role'),
                    queryParamName: 'role',
                    options: [
                      { value: 'admin', label: t('teams.roles.admin') },
                      { value: 'editor', label: t('teams.roles.editor') },
                      { value: 'viewer', label: t('teams.roles.viewer') },
                    ],
                  },
                  {
                    columnId: 'status',
                    title: t('teams.status'),
                    queryParamName: 'status',
                    options: [
                      { value: 'INVITED', label: t('teams.statuses.invited') },
                      { value: 'ACCEPTED', label: t('teams.statuses.accepted') },
                    ],
                  },
                ],
              }}
              useQueryFn={useGetOrganizationMembers}
              staticParams={{ organizationId }}
              queryFields={{
                id: null,
                firstName: null,
                lastName: null,
                email: null,
                role: null,
                status: null,
                mfaEnabled: null,
                ssoLinked: null,
                createdAt: null,
                user: {
                  fields: {
                    id: null,
                    profileImage: null,
                    firstName: null,
                    lastName: null,
                  },
                },
              }}
            />
          </div>
        </div>
      </LayoutContent>

      {changeRoleMember && (
        <ChangeMemberRoleModal
          open={!!changeRoleMember}
          onOpenChange={(open) => !open && setChangeRoleMember(null)}
          organizationId={organizationId}
          member={changeRoleMember}
        />
      )}

      {suspendMember && (
        <SuspendMemberModal
          open={!!suspendMember}
          onOpenChange={(open) => !open && setSuspendMember(null)}
          organizationId={organizationId}
          member={suspendMember}
        />
      )}

      {unsuspendMember && (
        <UnsuspendMemberModal
          open={!!unsuspendMember}
          onOpenChange={(open) => !open && setUnsuspendMember(null)}
          organizationId={organizationId}
          member={unsuspendMember}
        />
      )}

      {removeMember && (
        <RemoveMemberModal
          open={!!removeMember}
          onOpenChange={(open) => !open && setRemoveMember(null)}
          organizationId={organizationId}
          member={removeMember}
        />
      )}
    </div>
  );
}
