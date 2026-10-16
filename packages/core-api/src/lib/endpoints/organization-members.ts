import {InviteOrganizationMember, OrganizationMember, UpdateOrganizationMemberRole,} from '@skeleton/core-api-models';
import {ApiClient} from '../api-client/api-client';
import {ApiCollectionResponse, GetQueryByIdParams,} from '../types';
import {GetOrganizationMembersParams} from "../queries/organization-members/use-get-organization-members";
import {GetOrganizationMembersStaticParams} from "../queries/organization-members/use-get-organization-member-by-id";

export class OrganizationMembersEndpoint {
  constructor(private client: ApiClient) {}

  async getOrganizationMembers(
    params: GetOrganizationMembersParams,
  ): Promise<ApiCollectionResponse<OrganizationMember>> {
    const { staticParams, fields, sort, offset = 0, limit = 20, filters } = params;
    return this.client.getCollection<OrganizationMember>(
      `/api/v1/organizations/${staticParams?.organizationId}/members`,
      fields,
      {
        offset,
        limit,
        ...filters,
        sort
      },
    );
  }

  async getOrganizationMember(
    params: GetQueryByIdParams<OrganizationMember, GetOrganizationMembersStaticParams>,
  ): Promise<OrganizationMember> {
    const { staticParams, id, fields } = params;
    return this.client.getById<OrganizationMember>(
      `/api/v1/organizations/${staticParams?.organizationId}/members/${id}`,
      fields,
    );
  }

  async updateOrganizationMemberRole(
    organizationId: string,
    memberId: string,
    updates: UpdateOrganizationMemberRole,
  ): Promise<OrganizationMember> {
    return this.client.put<OrganizationMember>(
      `/api/v1/organizations/${organizationId}/members/${memberId}`,
      updates,
    );
  }

  async inviteMember(
    organizationId: string,
    invitation: InviteOrganizationMember,
  ): Promise<OrganizationMember> {
    return this.client.post<OrganizationMember>(
      `/api/v1/organizations/${organizationId}/members`,
      invitation,
    );
  }

  async removeMember(
    organizationId: string,
    memberId: string,
  ): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/organizations/${organizationId}/members/${memberId}`,
    );
  }

  async suspendMember(
    organizationId: string,
    memberId: string,
  ): Promise<OrganizationMember> {
    return this.client.post<OrganizationMember>(
      `/api/v1/organizations/${organizationId}/members/${memberId}/suspension`,
      {},
    );
  }

  async unsuspendMember(
    organizationId: string,
    memberId: string,
  ): Promise<OrganizationMember> {
    return this.client.delete<OrganizationMember>(
      `/api/v1/organizations/${organizationId}/members/${memberId}/suspension`,
    );
  }
}
