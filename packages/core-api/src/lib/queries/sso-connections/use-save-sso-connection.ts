import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ReadSsoConnection, SaveSsoConnection } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from './invalidate-sso-queries';

export type SaveSsoConnectionParams = {
  organizationId: string;
  data: SaveSsoConnection;
};

export const saveSsoConnection = async (
  params: SaveSsoConnectionParams,
): Promise<ReadSsoConnection> => {
  return await skeletonApi.ssoConnections.saveSsoConnection(
    params.organizationId,
    params.data,
  );
};

/**
 * Creates the connection (PUT, 201) or replaces it (200). Used for the first save only: once a
 * connection exists the identity-provider card patches it, so that the settings it does not show
 * are not reset to their defaults.
 */
export const useSaveSsoConnection = (
  options?: Omit<
    UseMutationOptions<ReadSsoConnection, ApiError, SaveSsoConnectionParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSsoConnection,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
