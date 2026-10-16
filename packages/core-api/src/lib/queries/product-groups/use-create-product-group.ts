import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { CreateProductGroup, ReadProductGroup } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createProductGroup = async (
  data: CreateProductGroup,
): Promise<ReadProductGroup> => {
  return await skeletonApi.productGroups.createProductGroup(data);
};

export const useCreateProductGroup = (
  options?: Omit<
    UseMutationOptions<ReadProductGroup, ApiError, CreateProductGroup>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductGroup,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
