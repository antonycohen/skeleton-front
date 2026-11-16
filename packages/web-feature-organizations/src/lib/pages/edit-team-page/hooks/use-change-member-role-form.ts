import { useForm } from 'react-hook-form';
import {
  MemberRole,
  OrganizationMember,
  UpdateOrganizationMemberRole,
  updateOrganizationMemberRoleSchema,
} from '@skeleton/core-api-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateOrganizationMemberRole } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type UseChangeMemberRoleFormOptions = {
  organizationId: string;
  member: OrganizationMember;
  onSuccess?: () => void;
  /** The API refused the change (409): the member is the last admin, or the directory sets their role. */
  onConflict?: () => void;
};

export const useChangeMemberRoleForm = ({
  organizationId,
  member,
  onSuccess,
  onConflict,
}: UseChangeMemberRoleFormOptions) => {
  const { t } = useTranslation();
  const form = useForm<UpdateOrganizationMemberRole>({
    resolver: zodResolver(updateOrganizationMemberRoleSchema),
    defaultValues: {
      role: member.role ?? 'viewer',
    },
  });

  const updateMember = useUpdateOrganizationMemberRole({
    onSuccess: () => {
      toast.success(t('teams.changeRole.success'));
      onSuccess?.();
    },
    onError: (error) => {
      // A 409 is about the member, not the form (last admin, or a role the directory sets): the
      // row was stale, the list refreshes, and the message is what the admin needs.
      if (error.httpCode === 409) {
        toast.error(error.error);
        onConflict?.();
        return;
      }
      handleApiError(error, form);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!member.id) return;
    updateMember.mutate({
      organizationId,
      memberId: member.id,
      data,
    });
  });

  const currentRole = member.role as MemberRole | null;

  return { form, handleSubmit, isLoading: updateMember.isPending, currentRole };
};
