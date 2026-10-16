import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { Organization } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getOrganizations = async (
  params: GetCollectionQueryParams<Organization>,
): Promise<ApiCollectionResponse<Organization>> => {
  return await skeletonApi.organizations.getOrganizations(params);
};

export const useGetOrganizations = (
  params: GetCollectionQueryParams<Organization>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<Organization>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['organizations', params],
    queryFn: () => getOrganizations(params),
    ...options,
  });
