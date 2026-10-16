import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { MfaFreshProofRequest, MfaRecoveryCodes } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateUserMfaQueries } from './invalidate-user-mfa-queries';

export type RegenerateMfaRecoveryCodesParams = {
  userId: string;
  data: MfaFreshProofRequest;
};

export const regenerateMfaRecoveryCodes = async (
  params: RegenerateMfaRecoveryCodesParams,
): Promise<MfaRecoveryCodes> => {
  return await skeletonApi.users.regenerateMfaRecoveryCodes(params.userId, params.data);
};

/** Replaces every recovery code; the previous ones stop working immediately. */
export const useRegenerateMfaRecoveryCodes = (
  options?: Omit<
    UseMutationOptions<MfaRecoveryCodes, ApiError, RegenerateMfaRecoveryCodesParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: regenerateMfaRecoveryCodes,
    onSuccess: (...args) => {
      invalidateUserMfaQueries(queryClient, args[1].userId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
