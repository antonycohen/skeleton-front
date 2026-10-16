import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from './invalidate-sso-queries';

export type DeleteSsoConnectionParams = {
  organizationId: string;
};

export const deleteSsoConnection = async (
  params: DeleteSsoConnectionParams,
): Promise<void> => {
  return await skeletonApi.ssoConnections.deleteSsoConnection(params.organizationId);
};

/** Removes the connection. Refused (409) while it is enforced: the requirement is lifted first. */
export const useDeleteSsoConnection = (
  options?: Omit<
    UseMutationOptions<void, ApiError, DeleteSsoConnectionParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSsoConnection,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
