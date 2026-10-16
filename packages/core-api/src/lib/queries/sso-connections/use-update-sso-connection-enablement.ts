import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ReadSsoConnection } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from './invalidate-sso-queries';

export type UpdateSsoConnectionEnablementParams = {
  organizationId: string;
  /** `true` lets the workspace's verified domains sign in through the connection, `false` stops it. */
  enabled: boolean;
};

export const updateSsoConnectionEnablement = async (
  params: UpdateSsoConnectionEnablementParams,
): Promise<ReadSsoConnection> => {
  return params.enabled
    ? await skeletonApi.ssoConnections.enableSsoConnection(params.organizationId)
    : await skeletonApi.ssoConnections.disableSsoConnection(params.organizationId);
};

/**
 * Moves the connection between `tested` and `enabled`. The API is the gate: 409 (5506) when the
 * connection was never tested or the workspace has no verified domain, 409 (5502) when disabling
 * one that is still enforced. Its message says which, and a retry would not help.
 */
export const useUpdateSsoConnectionEnablement = (
  options?: Omit<
    UseMutationOptions<
      ReadSsoConnection,
      ApiError,
      UpdateSsoConnectionEnablementParams
    >,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSsoConnectionEnablement,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
