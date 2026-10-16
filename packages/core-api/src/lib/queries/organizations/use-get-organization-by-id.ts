import { GetQueryByIdParams } from '../../types';
import { Organization } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getOrganizationById = async (
  params: GetQueryByIdParams<Organization>,
): Promise<Organization> => {
  return await skeletonApi.organizations.getOrganization(params);
};

export const useGetOrganizationById = (
  params: GetQueryByIdParams<Organization>,
  options?: Omit<UseQueryOptions<Organization, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['organization', params.id, params.fields],
    queryFn: () => getOrganizationById(params),
    ...options,
  });
