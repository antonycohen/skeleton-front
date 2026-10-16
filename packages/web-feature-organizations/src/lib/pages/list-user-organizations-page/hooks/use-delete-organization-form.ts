import { useForm } from 'react-hook-form';
import { Organization } from '@skeleton/core-api-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRemoveOrganization } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useTranslation } from '@skeleton/core-translations';

const deleteConfirmationSchema = z.object({
  confirmation: z.string().superRefine((val, ctx) => {
    if (val !== 'DELETE') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'userWorkspaces.delete.confirmationMismatch',
      });
    }
  }),
});

type DeleteConfirmation = z.infer<typeof deleteConfirmationSchema>;

type UseDeleteOrganizationFormOptions = {
  organization: Organization;
  onSuccess?: () => void;
};

export const useDeleteOrganizationForm = ({
  organization,
  onSuccess,
}: UseDeleteOrganizationFormOptions) => {
  const { t } = useTranslation();
  const form = useForm<DeleteConfirmation>({
    resolver: zodResolver(deleteConfirmationSchema),
    defaultValues: {
      confirmation: '',
    },
  });

  const removeOrganization = useRemoveOrganization({
    onSuccess: () => {
      toast.success(t('userWorkspaces.delete.success'));
      onSuccess?.();
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit(() => {
    if (!organization.id) return;
    removeOrganization.mutate({
      organizationId: organization.id,
    });
  });

  const isConfirmationValid = form.watch('confirmation') === 'DELETE';

  return {
    form,
    handleSubmit,
    isLoading: removeOrganization.isPending,
    isConfirmationValid,
  };
};
