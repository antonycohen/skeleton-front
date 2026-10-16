import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { UpdateProductGroup, ReadProductGroup } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdateProductGroupParams = {
  id: string;
  data: UpdateProductGroup;
};

export const updateProductGroup = async (
  params: UpdateProductGroupParams,
): Promise<ReadProductGroup> => {
  return await skeletonApi.productGroups.updateProductGroup(params.id, params.data);
};

export const useUpdateProductGroup = (
  options?: Omit<
    UseMutationOptions<ReadProductGroup, ApiError, UpdateProductGroupParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductGroup,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
