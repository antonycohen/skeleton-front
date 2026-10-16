import {CreateOrganization, Organization, OrganizationMember, UpdateOrganization} from '@skeleton/core-api-models';
import {ApiClient} from '../api-client/api-client';
import {ApiCollectionResponse, GetCollectionQueryParams, GetQueryByIdParams,} from '../types';
import {GetUserOrganizationsParams} from "../queries/organizations/use-get-user-organizations";

export class OrganizationsEndpoint {
  constructor(private client: ApiClient) {}

  async getOrganization(
    params: GetQueryByIdParams<Organization>,
  ): Promise<Organization> {
    return this.client.getById<Organization>(
      `/api/v1/organizations/${params.id}`,
      params.fields,
    );
  }

  async getOrganizations(
    params: GetCollectionQueryParams<Organization>,
  ): Promise<ApiCollectionResponse<Organization>> {
    const { fields, offset, limit, filters } = params;
    return this.client.getCollection<Organization>(
      `/api/v1/organizations`,
      fields,
      {
        offset,
        limit,
        ...filters,
      },
    );
  }

  async getUserOrganizations(
    params: GetUserOrganizationsParams,
  ): Promise<ApiCollectionResponse<Organization>> {
    const { fields, offset, limit, filters, staticParams, sort } = params;
    return this.client.getCollection<Organization>(
      `/api/v1/users/${staticParams?.userId}/organizations`,
      fields,
      {
        offset,
        limit,
        ...filters,
        sort,
      },
    );
  }

  async createUserOrganization(
    userId: string,
    data: CreateOrganization
  ): Promise<Organization> {
    return this.client.post<Organization>(
      `/api/v1/users/${userId}/organizations`,
      data,
    );
  }

  /** Staff-only creation (`organization:*:create`). */
  async createOrganization(data: CreateOrganization): Promise<Organization> {
    return this.client.post<Organization>(`/api/v1/organizations`, data);
  }

  async removeOrganization(
    organizationId: string,
  ): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/organizations/${organizationId}`,
    );
  }

  async cancelOrganizationDeletion(
    organizationId: string,
  ): Promise<void> {
    return this.client.post<void>(
      `/api/v1/organizations/${organizationId}/cancel-deletion`,
    );
  }

  async updateOrganization(
    organizationId: string,
    updates: UpdateOrganization,
  ): Promise<OrganizationMember> {
    return this.client.patch<OrganizationMember>(
      `/api/v1/organizations/${organizationId}`,
      updates,
    );
  }

  /**
   * Requires two-factor authentication from every member of the workspace. Workspace admins
   * only (403 otherwise); 409 when the caller has no second factor on their own account.
   */
  async requireMfa(organizationId: string): Promise<Organization> {
    return this.client.post<Organization>(
      `/api/v1/organizations/${organizationId}/mfa-requirement`,
    );
  }

  /** Lifts the two-factor authentication requirement. Workspace admins only (403 otherwise). */
  async liftMfaRequirement(organizationId: string): Promise<Organization> {
    return this.client.delete<Organization>(
      `/api/v1/organizations/${organizationId}/mfa-requirement`,
    );
  }

  /**
   * Makes enterprise single sign-on available to the workspace (`sso_available`). Back office only:
   * the permission is held through the super-admin alias, no workspace role grants it.
   */
  async grantSsoAvailability(organizationId: string): Promise<Organization> {
    return this.client.post<Organization>(
      `/api/v1/organizations/${organizationId}/sso-availability`,
    );
  }

  /**
   * Withdraws it. 409 while the workspace's connection is enforced — the requirement is lifted
   * first, and the API's message says so.
   */
  async withdrawSsoAvailability(organizationId: string): Promise<Organization> {
    return this.client.delete<Organization>(
      `/api/v1/organizations/${organizationId}/sso-availability`,
    );
  }
}
