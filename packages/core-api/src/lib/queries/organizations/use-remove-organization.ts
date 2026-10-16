import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';

export type RemoveOrganizationParams = {
  organizationId: string;
};

export const removeOrganization = async (
  params: RemoveOrganizationParams,
): Promise<void> => {
  return await skeletonApi.organizations.removeOrganization(params.organizationId);
};

export const useRemoveOrganization = (
  options?: Omit<
    UseMutationOptions<void, ApiError, RemoveOrganizationParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeOrganization,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
      queryClient.removeQueries({
        queryKey: ['organization', args[1].organizationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
