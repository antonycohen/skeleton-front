import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReadProduct,
  UpdateProduct,
  updateProductSchema,
} from '@skeleton/core-api-models';
import { useUpdateProduct } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

const normalizeQuotas = (
  quotas: Record<string, unknown> | null | undefined,
): Record<string, number> => {
  if (!quotas) return {};
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(quotas)) {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(parsed)) {
      result[key] = parsed;
    }
  }
  return result;
};

export const useEditProductForm = (
  product?: ReadProduct,
  onSuccess?: () => void,
) => {
  const { t } = useTranslation();
  const form = useForm<UpdateProduct>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
      type: 'service',
      quotas: {},
    },
    values: product
      ? {
          name: product.name ?? '',
          description: product.description ?? '',
          active: product.active ?? true,
          type: 'service',
          quotas: normalizeQuotas(product.quotas),
        }
      : undefined,
  });

  const updateProduct = useUpdateProduct({
    onSuccess: () => {
      toast.success(t('adminPayment.products.updated'));
      onSuccess?.();
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data: UpdateProduct) => {
    if (!product?.id) return;
    updateProduct.mutate({
      id: product.id,
      data: { ...data, type: 'service' },
    });
  });

  return {
    form,
    handleSubmit,
    isUpdating: updateProduct.isPending,
  };
};
