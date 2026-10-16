import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { CreateOrganization, Organization } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

type CreateUserOrganizationVariables = {
  userId: string;
  data: CreateOrganization;
};

export const createUserOrganization = async (
  variables: CreateUserOrganizationVariables,
): Promise<Organization> => {
  return await skeletonApi.organizations.createUserOrganization(
    variables.userId,
    variables.data,
  );
};

export const useCreateUserOrganization = (
  options?: Omit<
    UseMutationOptions<Organization, ApiError, CreateUserOrganizationVariables>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserOrganization,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
