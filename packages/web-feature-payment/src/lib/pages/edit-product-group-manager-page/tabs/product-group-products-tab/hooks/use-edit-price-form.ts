import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReadPrice,
  UpdatePrice,
  updatePriceSchema,
} from '@skeleton/core-api-models';
import { useUpdatePrice } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

export const useEditPriceForm = (price?: ReadPrice, onSuccess?: () => void) => {
  const { t } = useTranslation();
  const form = useForm<UpdatePrice>({
    resolver: zodResolver(updatePriceSchema),
    defaultValues: {
      nickname: '',
    },
    values: price
      ? {
          nickname: price.nickname ?? '',
        }
      : undefined,
  });

  const updatePrice = useUpdatePrice({
    onSuccess: () => {
      toast.success(t('adminPayment.prices.updatedSuccessfully'));
      onSuccess?.();
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data: UpdatePrice) => {
    if (!price?.id) return;
    updatePrice.mutate({ id: price.id, data: { nickname: data.nickname } });
  });

  return {
    form,
    handleSubmit,
    isUpdating: updatePrice.isPending,
  };
};
