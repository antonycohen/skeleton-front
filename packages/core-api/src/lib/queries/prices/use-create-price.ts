import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { CreatePrice, ReadPrice } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createPrice = async (data: CreatePrice): Promise<ReadPrice> => {
  return await skeletonApi.prices.createPrice(data);
};

export const useCreatePrice = (
  options?: Omit<
    UseMutationOptions<ReadPrice, ApiError, CreatePrice>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrice,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
