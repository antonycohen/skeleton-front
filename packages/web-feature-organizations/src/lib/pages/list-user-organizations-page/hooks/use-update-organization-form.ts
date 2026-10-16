import { useForm } from 'react-hook-form';
import {
  Organization,
  UpdateOrganization,
  updateOrganizationSchema,
} from '@skeleton/core-api-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateOrganization } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type UseUpdateOrganizationFormOptions = {
  organization: Organization;
  onSuccess?: () => void;
};

export const useUpdateOrganizationForm = ({
  organization,
  onSuccess,
}: UseUpdateOrganizationFormOptions) => {
  const { t } = useTranslation();
  const form = useForm<UpdateOrganization>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: organization.name ?? '',
    },
  });

  const updateOrganization = useUpdateOrganization({
    onSuccess: () => {
      toast.success(t('userWorkspaces.rename.success'));
      onSuccess?.();
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!organization.id) return;
    updateOrganization.mutate({
      organizationId: organization.id,
      data,
    });
  });

  return { form, handleSubmit, isLoading: updateOrganization.isPending };
};
