import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ReadSsoConnection } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from './invalidate-sso-queries';

export type UpdateSsoConnectionEnforcementParams = {
  organizationId: string;
  /** `true` makes the identity provider the only way in for the verified domains, `false` lifts it. */
  enforced: boolean;
};

export const updateSsoConnectionEnforcement = async (
  params: UpdateSsoConnectionEnforcementParams,
): Promise<ReadSsoConnection> => {
  return params.enforced
    ? await skeletonApi.ssoConnections.enforceSsoConnection(params.organizationId)
    : await skeletonApi.ssoConnections.liftSsoEnforcement(params.organizationId);
};

/**
 * Requires single sign-on for the workspace's verified domains, or lifts the requirement. The API
 * is the gate: 409 (5506) while the connection is not enabled, and 409 (5508) when the admin's own
 * session did not come through the connection — that message ("sign in through your identity
 * provider first") is the one to show, not a generic failure.
 */
export const useUpdateSsoConnectionEnforcement = (
  options?: Omit<
    UseMutationOptions<
      ReadSsoConnection,
      ApiError,
      UpdateSsoConnectionEnforcementParams
    >,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSsoConnectionEnforcement,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
