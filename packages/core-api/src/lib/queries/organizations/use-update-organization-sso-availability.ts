import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { Organization } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from '../sso-connections/invalidate-sso-queries';

export type UpdateOrganizationSsoAvailabilityParams = {
  organizationId: string;
  /** `true` makes enterprise single sign-on available to the workspace, `false` withdraws it. */
  available: boolean;
};

export const updateOrganizationSsoAvailability = async (
  params: UpdateOrganizationSsoAvailabilityParams,
): Promise<Organization> => {
  return params.available
    ? await skeletonApi.organizations.grantSsoAvailability(params.organizationId)
    : await skeletonApi.organizations.withdrawSsoAvailability(params.organizationId);
};

/**
 * Switches a workspace's enterprise single sign-on entitlement from the back office. The API is the
 * gate: 403 for anyone but a super admin, 409 when withdrawing it while the workspace's connection
 * is enforced — its message ("lift the requirement first") is the one to show.
 *
 * The whole SSO set is invalidated, not just the organization: granting the entitlement turns every
 * 404 on the connection, the domains and the certificates into a real answer, and withdrawing it
 * does the reverse.
 */
export const useUpdateOrganizationSsoAvailability = (
  options?: Omit<
    UseMutationOptions<
      Organization,
      ApiError,
      UpdateOrganizationSsoAvailabilityParams
    >,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganizationSsoAvailability,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
