import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { CreateOrganization, Organization } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

type CreateOrganizationVariables = {
  data: CreateOrganization;
};

export const createOrganization = async (
  variables: CreateOrganizationVariables,
): Promise<Organization> => {
  return await skeletonApi.organizations.createOrganization(variables.data);
};

/** Staff-only: creates an organization of any type. */
export const useCreateOrganization = (
  options?: Omit<
    UseMutationOptions<Organization, ApiError, CreateOrganizationVariables>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
