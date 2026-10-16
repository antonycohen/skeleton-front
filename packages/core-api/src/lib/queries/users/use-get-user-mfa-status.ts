import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { MfaStatus } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type GetUserMfaStatusParams = {
  userId: string;
};

/** Cache key of a user's second-factor status; every MFA mutation invalidates it. */
export const userMfaStatusQueryKey = (userId: string) => ['user', userId, 'mfa'] as const;

export const getUserMfaStatus = async (params: GetUserMfaStatusParams): Promise<MfaStatus> => {
  return await skeletonApi.users.getMfaStatus(params.userId);
};

export const useGetUserMfaStatus = (
  params: GetUserMfaStatusParams,
  options?: Omit<UseQueryOptions<MfaStatus, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: userMfaStatusQueryKey(params.userId),
    queryFn: () => getUserMfaStatus(params),
    ...options,
  });
