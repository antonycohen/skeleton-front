import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateProduct,
  createProductSchema,
  ReadProduct,
} from '@skeleton/core-api-models';
import { useCreateProduct } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type UseNewProductFormOptions = {
  productGroupId: string;
  onSuccess?: (product: ReadProduct) => void;
};

const buildDefaults = (productGroupId: string): CreateProduct => ({
  id: '',
  name: '',
  description: '',
  active: true,
  type: 'service',
  quotas: {},
  productGroup: { id: productGroupId },
});

export const useNewProductForm = ({
  productGroupId,
  onSuccess,
}: UseNewProductFormOptions) => {
  const { t } = useTranslation();
  const form = useForm<CreateProduct>({
    resolver: zodResolver(createProductSchema),
    defaultValues: buildDefaults(productGroupId),
  });

  const createProduct = useCreateProduct({
    onSuccess: (product) => {
      toast.success(t('adminPayment.products.created'));
      form.reset(buildDefaults(productGroupId));
      onSuccess?.(product);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data: CreateProduct) => {
    createProduct.mutate({
      ...data,
      type: 'service',
      productGroup: { id: productGroupId },
    });
  });

  return {
    form,
    handleSubmit,
    isCreating: createProduct.isPending,
  };
};
