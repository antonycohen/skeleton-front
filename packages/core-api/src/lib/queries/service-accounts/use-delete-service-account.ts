import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';

export type DeleteServiceAccountParams = {
  organizationId: string;
  serviceAccountId: string;
};

export const deleteServiceAccount = async (
  params: DeleteServiceAccountParams,
): Promise<void> => {
  return await skeletonApi.serviceAccounts.deleteServiceAccount(
    params.organizationId,
    params.serviceAccountId,
  );
};

export const useDeleteServiceAccount = (
  options?: Omit<
    UseMutationOptions<void, ApiError, DeleteServiceAccountParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteServiceAccount,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['service-accounts', args[1].organizationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
