import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReadProductGroup,
  UpdateProductGroup,
  updateProductGroupSchema,
} from '@skeleton/core-api-models';
import { useUpdateProductGroup } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

export const useEditProductGroupProfileForm = (
  productGroup?: ReadProductGroup,
) => {
  const { t } = useTranslation();
  const form = useForm<UpdateProductGroup>({
    resolver: zodResolver(updateProductGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
    },
    values: productGroup
      ? {
          name: productGroup.name ?? '',
          description: productGroup.description ?? '',
          active: productGroup.active ?? true,
        }
      : undefined,
  });

  const updateProductGroup = useUpdateProductGroup({
    onSuccess: () => {
      toast.success(t('adminPayment.productGroup.profile.updated'));
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data: UpdateProductGroup) => {
    if (!productGroup?.id) return;
    updateProductGroup.mutate({
      id: productGroup.id,
      data,
    });
  });

  return {
    form,
    handleSubmit,
    isUpdating: updateProductGroup.isPending,
  };
};
