import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { CreatedServiceAccount, CreateServiceAccount } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type CreateServiceAccountParams = {
  organizationId: string;
  data: CreateServiceAccount;
};

export const createServiceAccount = async (
  params: CreateServiceAccountParams,
): Promise<CreatedServiceAccount> => {
  return await skeletonApi.serviceAccounts.createServiceAccount(
    params.organizationId,
    params.data,
  );
};

export const useCreateServiceAccount = (
  options?: Omit<
    UseMutationOptions<CreatedServiceAccount, ApiError, CreateServiceAccountParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServiceAccount,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['service-accounts', args[1].organizationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
