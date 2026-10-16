import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ReadSsoDomain } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from '../sso-connections/invalidate-sso-queries';

export type VerifySsoDomainParams = {
  organizationId: string;
  domainId: string;
};

export const verifySsoDomain = async (
  params: VerifySsoDomainParams,
): Promise<ReadSsoDomain> => {
  return await skeletonApi.ssoDomains.verifySsoDomain(
    params.organizationId,
    params.domainId,
  );
};

/**
 * Checks the DNS now. The refusals differ in what the admin has to do — the record is not visible
 * yet (422) or the DNS did not answer (503) — so callers show the API's message rather than one of
 * their own. A verified domain enables the connection: the whole SSO set is invalidated.
 */
export const useVerifySsoDomain = (
  options?: Omit<
    UseMutationOptions<ReadSsoDomain, ApiError, VerifySsoDomainParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifySsoDomain,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
