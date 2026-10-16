import { useForm } from 'react-hook-form';
import { InviteOrganizationMember, inviteOrganizationMemberSchema } from '@skeleton/core-api-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInviteOrganizationMember } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

export const useInviteOrganizationMemberForm = (organizationId: string) => {
  const { t } = useTranslation();

  const form = useForm<InviteOrganizationMember>({
    resolver: zodResolver(inviteOrganizationMemberSchema),
    defaultValues: {
      email: '',
      role: 'editor',
    },
  });

  const inviteMember = useInviteOrganizationMember({
    onSuccess: () => {
      toast.success(t('teams.invite.success'));
      form.reset();
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    inviteMember.mutate({
      organizationId,
      data,
    });
  });

  return { form, handleSubmit, isLoading: inviteMember.isPending };
};
