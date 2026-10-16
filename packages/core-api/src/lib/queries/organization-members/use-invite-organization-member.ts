import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import {InviteOrganizationMember, OrganizationMember} from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type InviteOrganizationMemberParams = {
  organizationId: string;
  data: InviteOrganizationMember;
};

export const inviteOrganizationMember = async (
  params: InviteOrganizationMemberParams,
): Promise<OrganizationMember> => {
  return await skeletonApi.organizationMembers.inviteMember(
    params.organizationId,
    params.data,
  );
};

export const useInviteOrganizationMember = (
  options?: Omit<
    UseMutationOptions<OrganizationMember, ApiError, InviteOrganizationMemberParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteOrganizationMember,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', args[1].organizationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
