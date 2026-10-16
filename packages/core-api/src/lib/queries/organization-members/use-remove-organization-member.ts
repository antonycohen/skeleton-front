import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';

export type RemoveOrganizationMemberParams = {
  organizationId: string;
  memberId: string;
};

export const removeOrganizationMember = async (
  params: RemoveOrganizationMemberParams,
): Promise<void> => {
  return await skeletonApi.organizationMembers.removeMember(
    params.organizationId,
    params.memberId,
  );
};

export const useRemoveOrganizationMember = (
  options?: Omit<
    UseMutationOptions<void, ApiError, RemoveOrganizationMemberParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeOrganizationMember,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', args[1].organizationId],
      });
      queryClient.removeQueries({
        queryKey: ['organization-member', args[1].organizationId, args[1].memberId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
