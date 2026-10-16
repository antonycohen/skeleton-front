import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';
import { invalidateUserMfaQueries } from './invalidate-user-mfa-queries';

export type ResetUserMfaParams = {
  userId: string;
};

export const resetUserMfa = async (params: ResetUserMfaParams): Promise<void> => {
  return await skeletonApi.users.resetMfa(params.userId);
};

/** Back office only: clears a user's second factor so they enrol again at their next sign-in. */
export const useResetUserMfa = (
  options?: Omit<UseMutationOptions<void, ApiError, ResetUserMfaParams>, 'mutationFn'>,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetUserMfa,
    onSuccess: (...args) => {
      invalidateUserMfaQueries(queryClient, args[1].userId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
