import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { ReadProduct, UpdateProduct } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdateProductParams = {
  id: string;
  data: UpdateProduct;
};

export const updateProduct = async (
  params: UpdateProductParams,
): Promise<ReadProduct> => {
  return await skeletonApi.products.updateProduct(params.id, params.data);
};

export const useUpdateProduct = (
  options?: Omit<
    UseMutationOptions<ReadProduct, ApiError, UpdateProductParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
