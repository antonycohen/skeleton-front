import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { OrganizationMember, UpdateOrganization } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdateOrganizationParams = {
  organizationId: string;
  data: UpdateOrganization;
};

export const updateOrganization = async (
  params: UpdateOrganizationParams,
): Promise<OrganizationMember> => {
  return await skeletonApi.organizations.updateOrganization(
    params.organizationId,
    params.data,
  );
};

export const useUpdateOrganization = (
  options?: Omit<
    UseMutationOptions<OrganizationMember, ApiError, UpdateOrganizationParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['organization', args[1].organizationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
