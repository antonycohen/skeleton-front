import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { MoveProductsOperation } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type RepositionProductsParams = {
  productGroupId: string;
  operation: MoveProductsOperation;
};

export const repositionProducts = async (
  params: RepositionProductsParams,
): Promise<void> => {
  return await skeletonApi.products.repositionProducts(
    params.productGroupId,
    params.operation,
  );
};

export const useRepositionProducts = (
  options?: Omit<
    UseMutationOptions<void, ApiError, RepositionProductsParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repositionProducts,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
