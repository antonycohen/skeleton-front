import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { OrganizationMember, UpdateOrganizationMemberRole } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdateOrganizationMemberRoleParams = {
  organizationId: string;
  memberId: string;
  data: UpdateOrganizationMemberRole;
};

export const updateOrganizationMemberRole = async (
  params: UpdateOrganizationMemberRoleParams,
): Promise<OrganizationMember> => {
  return await skeletonApi.organizationMembers.updateOrganizationMemberRole(
    params.organizationId,
    params.memberId,
    params.data,
  );
};

export const useUpdateOrganizationMemberRole = (
  options?: Omit<
    UseMutationOptions<OrganizationMember, ApiError, UpdateOrganizationMemberRoleParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganizationMemberRole,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', args[1].organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['organization-member', args[1].organizationId, args[1].memberId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
