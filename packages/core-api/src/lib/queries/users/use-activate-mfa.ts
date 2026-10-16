import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { MfaCodeRequest, MfaRecoveryCodes } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateUserMfaQueries } from './invalidate-user-mfa-queries';

export type ActivateMfaParams = {
  userId: string;
  data: MfaCodeRequest;
};

export const activateMfa = async (params: ActivateMfaParams): Promise<MfaRecoveryCodes> => {
  return await skeletonApi.users.activateMfa(params.userId, params.data);
};

/** Confirms a pending enrolment with one authenticator code; the recovery codes come back once. */
export const useActivateMfa = (
  options?: Omit<UseMutationOptions<MfaRecoveryCodes, ApiError, ActivateMfaParams>, 'mutationFn'>,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateMfa,
    onSuccess: (...args) => {
      invalidateUserMfaQueries(queryClient, args[1].userId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
