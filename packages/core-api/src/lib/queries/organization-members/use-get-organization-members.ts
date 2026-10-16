import {ApiCollectionResponse, GetCollectionQueryParams} from '../../types';
import {MemberRole, MemberStatus, OrganizationMember} from '@skeleton/core-api-models';
import {ApiError, skeletonApi} from '../../api';
import {useQuery, UseQueryOptions} from '@tanstack/react-query';


type GetOrganizationMembersQueryParams = {
  status?: MemberStatus;
  role?: MemberRole;
  term?: string;
}

type GetOrganizationMembersStaticParams = {
  organizationId: string;
}

export type GetOrganizationMembersParams = GetCollectionQueryParams<OrganizationMember, GetOrganizationMembersStaticParams> & {
  filters?: GetOrganizationMembersQueryParams;
};

export const getOrganizationMembers = async (
  params: GetOrganizationMembersParams,
): Promise<ApiCollectionResponse<OrganizationMember>> => {
  return await skeletonApi.organizationMembers.getOrganizationMembers(params);
};

export const useGetOrganizationMembers = (
  params: GetOrganizationMembersParams,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<OrganizationMember>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['organization-members', params.staticParams?.organizationId, params],
    queryFn: () => getOrganizationMembers(params),
    ...options,
  });
