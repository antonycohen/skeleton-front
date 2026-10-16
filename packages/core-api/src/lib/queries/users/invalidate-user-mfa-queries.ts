import { QueryClient } from '@tanstack/react-query';
import { userMfaStatusQueryKey } from './use-get-user-mfa-status';

/**
 * Everything that reflects a user's second factor: the status query, the user itself
 * (`useGetUserById` keys on `[id, fields]`, and `UserDto.mfaEnabled` is a projection of the same
 * state), the user lists, and the workspace member lists an admin reads `mfaEnabled` from.
 */
export const invalidateUserMfaQueries = (queryClient: QueryClient, userId: string) => {
  queryClient.invalidateQueries({ queryKey: userMfaStatusQueryKey(userId) });
  queryClient.invalidateQueries({ queryKey: [userId] });
  queryClient.invalidateQueries({ queryKey: ['users'] });
  queryClient.invalidateQueries({ queryKey: ['organization-members'] });
};
