import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { MfaFreshProofRequest } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateUserMfaQueries } from './invalidate-user-mfa-queries';

export type DisableMfaParams = {
  userId: string;
  data: MfaFreshProofRequest;
};

export const disableMfa = async (params: DisableMfaParams): Promise<void> => {
  return await skeletonApi.users.disableMfa(params.userId, params.data);
};

export const useDisableMfa = (
  options?: Omit<UseMutationOptions<void, ApiError, DisableMfaParams>, 'mutationFn'>,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableMfa,
    onSuccess: (...args) => {
      invalidateUserMfaQueries(queryClient, args[1].userId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
