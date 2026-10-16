import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { OrganizationMember } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UnsuspendOrganizationMemberParams = {
  organizationId: string;
  memberId: string;
};

export const unsuspendOrganizationMember = async (
  params: UnsuspendOrganizationMemberParams,
): Promise<OrganizationMember> => {
  return await skeletonApi.organizationMembers.unsuspendMember(
    params.organizationId,
    params.memberId,
  );
};

export const useUnsuspendOrganizationMember = (
  options?: Omit<
    UseMutationOptions<OrganizationMember, ApiError, UnsuspendOrganizationMemberParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsuspendOrganizationMember,
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
