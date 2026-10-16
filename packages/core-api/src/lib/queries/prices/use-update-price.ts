import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { ReadPrice, UpdatePrice } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdatePriceParams = {
  id: string;
  data: UpdatePrice;
};

export const updatePrice = async (
  params: UpdatePriceParams,
): Promise<ReadPrice> => {
  return await skeletonApi.prices.updatePrice(params.id, params.data);
};

export const useUpdatePrice = (
  options?: Omit<
    UseMutationOptions<ReadPrice, ApiError, UpdatePriceParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrice,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
