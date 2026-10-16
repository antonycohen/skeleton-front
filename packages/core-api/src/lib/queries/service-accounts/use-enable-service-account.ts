import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ServiceAccount } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type EnableServiceAccountParams = {
  organizationId: string;
  serviceAccountId: string;
};

export const enableServiceAccount = async (
  params: EnableServiceAccountParams,
): Promise<ServiceAccount> => {
  return await skeletonApi.serviceAccounts.enableServiceAccount(
    params.organizationId,
    params.serviceAccountId,
  );
};

export const useEnableServiceAccount = (
  options?: Omit<
    UseMutationOptions<ServiceAccount, ApiError, EnableServiceAccountParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enableServiceAccount,
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
