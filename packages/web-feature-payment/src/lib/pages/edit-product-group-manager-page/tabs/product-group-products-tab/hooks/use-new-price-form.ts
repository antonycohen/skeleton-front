import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreatePrice,
  createPriceSchema,
  ReadPrice,
} from '@skeleton/core-api-models';
import { useCreatePrice } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type UseNewPriceFormOptions = {
  productId: string;
  onSuccess?: (price: ReadPrice) => void;
};

export const useNewPriceForm = ({
  productId,
  onSuccess,
}: UseNewPriceFormOptions) => {
  const { t } = useTranslation();
  const form = useForm<CreatePrice>({
    resolver: zodResolver(createPriceSchema),
    defaultValues: {
      nickname: '',
      product: { id: productId },
      currency: 'eur',
      lookupKey: '',
      recurringInterval: 'month',
      recurringUsageType: 'licensed',
      active: true,
      unitAmountInCents: 0,
    },
  });

  const createPrice = useCreatePrice({
    onSuccess: (price) => {
      toast.success(t('adminPayment.prices.created'));
      form.reset({
        nickname: '',
        product: { id: productId },
        currency: 'eur',
        lookupKey: '',
        recurringInterval: 'month',
        recurringUsageType: 'licensed',
        active: true,
        unitAmountInCents: 0,
      });
      onSuccess?.(price);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data: CreatePrice) => {
    createPrice.mutate({ ...data, product: { id: productId } });
  });

  return {
    form,
    handleSubmit,
    isCreating: createPrice.isPending,
  };
};
