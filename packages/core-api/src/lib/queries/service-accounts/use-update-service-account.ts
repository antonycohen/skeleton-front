import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ServiceAccount, UpdateServiceAccount } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdateServiceAccountParams = {
  organizationId: string;
  serviceAccountId: string;
  data: UpdateServiceAccount;
};

export const updateServiceAccount = async (
  params: UpdateServiceAccountParams,
): Promise<ServiceAccount> => {
  return await skeletonApi.serviceAccounts.updateServiceAccount(
    params.organizationId,
    params.serviceAccountId,
    params.data,
  );
};

export const useUpdateServiceAccount = (
  options?: Omit<
    UseMutationOptions<ServiceAccount, ApiError, UpdateServiceAccountParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateServiceAccount,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['service-accounts', args[1].organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['service-account', args[1].organizationId, args[1].serviceAccountId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
