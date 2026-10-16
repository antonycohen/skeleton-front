import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';

export type CancelOrganizationDeletionParams = {
  organizationId: string;
};

export const cancelOrganizationDeletion = async (
  params: CancelOrganizationDeletionParams,
): Promise<void> => {
  return await skeletonApi.organizations.cancelOrganizationDeletion(params.organizationId);
};

export const useCancelOrganizationDeletion = (
  options?: Omit<
    UseMutationOptions<void, ApiError, CancelOrganizationDeletionParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrganizationDeletion,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['organization', args[1].organizationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
