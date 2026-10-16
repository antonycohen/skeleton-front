import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ReadSsoConnection, SaveSsoConnection } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from './invalidate-sso-queries';

export type PatchSsoConnectionParams = {
  organizationId: string;
  data: SaveSsoConnection;
};

export const patchSsoConnection = async (
  params: PatchSsoConnectionParams,
): Promise<ReadSsoConnection> => {
  return await skeletonApi.ssoConnections.patchSsoConnection(
    params.organizationId,
    params.data,
  );
};

/**
 * Partial update of the connection. What is sent decides the effect: the provisioning settings
 * and a new client secret leave the status alone, the trust material (protocol, issuer, client
 * id) sends the connection back to `draft` and switches the requirement off.
 */
export const usePatchSsoConnection = (
  options?: Omit<
    UseMutationOptions<ReadSsoConnection, ApiError, PatchSsoConnectionParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchSsoConnection,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
