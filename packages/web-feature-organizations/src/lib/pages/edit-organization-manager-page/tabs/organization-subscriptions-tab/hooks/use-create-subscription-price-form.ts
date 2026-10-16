import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreatePrice,
  createPriceSchema,
  OrganizationType,
  ReadPrice,
} from '@skeleton/core-api-models';
import { useCreatePrice } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type UseCreateSubscriptionPriceFormOptions = {
  /** Prefills the organization-type tag with the displayed workspace's type. */
  organizationType?: OrganizationType | null;
  onSuccess?: (price: ReadPrice, submitted: CreatePrice) => void;
};

/**
 * "Create a new price" branch of the create-subscription flow: same shape as
 * `useNewPriceForm` in web-feature-payment, but with a free product choice and
 * the organization-type tag.
 */
export const useCreateSubscriptionPriceForm = ({
  organizationType,
  onSuccess,
}: UseCreateSubscriptionPriceFormOptions) => {
  const { t } = useTranslation();
  const defaultValues: CreatePrice = {
    nickname: '',
    product: { id: '' },
    currency: 'eur',
    lookupKey: '',
    recurringInterval: 'month',
    recurringUsageType: 'licensed',
    active: true,
    unitAmountInCents: 0,
    ...(organizationType ? { organizationType } : {}),
  };

  const form = useForm<CreatePrice>({
    resolver: zodResolver(createPriceSchema),
    defaultValues,
  });

  const createPrice = useCreatePrice({
    onSuccess: (price, submitted) => {
      toast.success(t('adminOrganizations.subscriptions.newPrice.created'));
      form.reset(defaultValues);
      onSuccess?.(price, submitted);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data: CreatePrice) => {
    // productRefSchema accepts any string; catch the untouched select here.
    if (!data.product?.id) {
      form.setError('product.id', {
        message: t('adminOrganizations.subscriptions.newPrice.productRequired'),
      });
      return;
    }
    createPrice.mutate(data);
  });

  return {
    form,
    handleSubmit,
    isCreating: createPrice.isPending,
    reset: () => form.reset(defaultValues),
  };
};
