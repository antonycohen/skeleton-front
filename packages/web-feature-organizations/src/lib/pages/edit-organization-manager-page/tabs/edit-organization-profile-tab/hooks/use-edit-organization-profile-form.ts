import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReadOrganization,
  UpdateOrganization,
  updateOrganizationSchema,
} from '@skeleton/core-api-models';
import { useUpdateOrganization } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

export const useEditOrganizationProfileForm = (
  organization?: ReadOrganization,
) => {
  const { t } = useTranslation();
  const form = useForm<UpdateOrganization>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: '',
      domain: '',
    },
    values: organization
      ? {
          name: organization.name ?? '',
          domain: organization.domain ?? '',
        }
      : undefined,
  });

  const updateOrganization = useUpdateOrganization({
    onSuccess: () => {
      toast.success(t('adminOrganizations.profile.updated'));
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data: UpdateOrganization) => {
    if (!organization?.id) return;
    updateOrganization.mutate({
      organizationId: organization.id,
      data,
    });
  });

  return {
    form,
    handleSubmit,
    isUpdating: updateOrganization.isPending,
  };
};
