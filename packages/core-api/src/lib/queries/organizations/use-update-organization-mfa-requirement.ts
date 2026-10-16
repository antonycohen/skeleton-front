import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { Organization } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdateOrganizationMfaRequirementParams = {
  organizationId: string;
  /** `true` requires two-factor authentication from every member, `false` lifts the requirement. */
  required: boolean;
};

export const updateOrganizationMfaRequirement = async (
  params: UpdateOrganizationMfaRequirementParams,
): Promise<Organization> => {
  return params.required
    ? await skeletonApi.organizations.requireMfa(params.organizationId)
    : await skeletonApi.organizations.liftMfaRequirement(params.organizationId);
};

/**
 * Switches the workspace's "every member must have two-factor authentication" option. The API is
 * the gate: 403 for anyone but a workspace admin, 409 when the caller requiring it has no second
 * factor on their own account.
 */
export const useUpdateOrganizationMfaRequirement = (
  options?: Omit<
    UseMutationOptions<Organization, ApiError, UpdateOrganizationMfaRequirementParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganizationMfaRequirement,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['organization', args[1].organizationId],
      });
      // The members' own status (`required` / `requiredBy`, keyed `['user', id, 'mfa']`) follows
      // the workspace option: without this the account page would keep offering "Disable".
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'user' && query.queryKey[2] === 'mfa',
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
