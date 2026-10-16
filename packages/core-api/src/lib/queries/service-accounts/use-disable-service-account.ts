import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ServiceAccount } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type DisableServiceAccountParams = {
  organizationId: string;
  serviceAccountId: string;
};

export const disableServiceAccount = async (
  params: DisableServiceAccountParams,
): Promise<ServiceAccount> => {
  return await skeletonApi.serviceAccounts.disableServiceAccount(
    params.organizationId,
    params.serviceAccountId,
  );
};

export const useDisableServiceAccount = (
  options?: Omit<
    UseMutationOptions<ServiceAccount, ApiError, DisableServiceAccountParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableServiceAccount,
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
