import {OrganizationMember} from '@skeleton/core-api-models';
import {ApiError, skeletonApi} from '../../api';
import {useQuery, UseQueryOptions} from '@tanstack/react-query';
import {GetQueryByIdParams} from "../../types";

export type GetOrganizationMembersStaticParams = {
  organizationId: string;
}


export const getOrganizationMemberById = async (
  params: GetQueryByIdParams<OrganizationMember, GetOrganizationMembersStaticParams>,
): Promise<OrganizationMember> => {
  return await skeletonApi.organizationMembers.getOrganizationMember(params);
};

export const useGetOrganizationMemberById = (
  params: GetQueryByIdParams<OrganizationMember, GetOrganizationMembersStaticParams>,
  options?: Omit<UseQueryOptions<OrganizationMember, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['organization-member', params.staticParams?.organizationId, params.id, params.fields],
    queryFn: () => getOrganizationMemberById(params),
    ...options,
  });
