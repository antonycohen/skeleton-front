import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { OrganizationMember } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type SuspendOrganizationMemberParams = {
  organizationId: string;
  memberId: string;
};

export const suspendOrganizationMember = async (
  params: SuspendOrganizationMemberParams,
): Promise<OrganizationMember> => {
  return await skeletonApi.organizationMembers.suspendMember(
    params.organizationId,
    params.memberId,
  );
};

export const useSuspendOrganizationMember = (
  options?: Omit<
    UseMutationOptions<OrganizationMember, ApiError, SuspendOrganizationMemberParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suspendOrganizationMember,
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
