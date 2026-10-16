import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { CreatedServiceAccount } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type RotateServiceAccountSecretParams = {
  organizationId: string;
  serviceAccountId: string;
};

export const rotateServiceAccountSecret = async (
  params: RotateServiceAccountSecretParams,
): Promise<CreatedServiceAccount> => {
  return await skeletonApi.serviceAccounts.rotateServiceAccountSecret(
    params.organizationId,
    params.serviceAccountId,
  );
};

export const useRotateServiceAccountSecret = (
  options?: Omit<
    UseMutationOptions<CreatedServiceAccount, ApiError, RotateServiceAccountSecretParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rotateServiceAccountSecret,
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
