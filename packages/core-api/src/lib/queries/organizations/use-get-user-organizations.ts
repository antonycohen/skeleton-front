import {ApiCollectionResponse, GetCollectionQueryParams, QueryParams} from '../../types';
import {Organization} from '@skeleton/core-api-models';
import {ApiError, skeletonApi} from '../../api';
import {useQuery, UseQueryOptions} from '@tanstack/react-query';

type GetUserOrganizationsQueryParams = QueryParams;

type GetUserOrganizationsStaticParams = {
  userId: string;
}

export type GetUserOrganizationsParams = GetCollectionQueryParams<Organization, GetUserOrganizationsStaticParams> & {
  filters?: GetUserOrganizationsQueryParams;
};



export const getUserOrganizations = async (
  params: GetUserOrganizationsParams,
): Promise<ApiCollectionResponse<Organization>> => {
  return await skeletonApi.organizations.getUserOrganizations(params);
};

export const useGetUserOrganizations = (
  params: GetUserOrganizationsParams,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<Organization>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['organizations', params.staticParams?.userId, params],
    queryFn: () => getUserOrganizations(params),
    ...options,
  });
