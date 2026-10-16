import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from '../sso-connections/invalidate-sso-queries';

export type DeleteSsoDomainParams = {
  organizationId: string;
  domainId: string;
};

export const deleteSsoDomain = async (
  params: DeleteSsoDomainParams,
): Promise<void> => {
  return await skeletonApi.ssoDomains.deleteSsoDomain(
    params.organizationId,
    params.domainId,
  );
};

/**
 * Drops a claim. Removing the last verified domain of an enabled or enforced connection returns it
 * to `tested`, which is why the connection is invalidated too.
 */
export const useDeleteSsoDomain = (
  options?: Omit<
    UseMutationOptions<void, ApiError, DeleteSsoDomainParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSsoDomain,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
