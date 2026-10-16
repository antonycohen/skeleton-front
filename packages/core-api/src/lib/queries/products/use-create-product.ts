import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { CreateProduct, ReadProduct } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createProduct = async (data: CreateProduct): Promise<ReadProduct> => {
  return await skeletonApi.products.createProduct(data);
};

export const useCreateProduct = (
  options?: Omit<
    UseMutationOptions<ReadProduct, ApiError, CreateProduct>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
