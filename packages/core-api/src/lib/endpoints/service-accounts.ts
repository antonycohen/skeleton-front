import {
  CreatedServiceAccount,
  CreateServiceAccount,
  ServiceAccount,
  ServiceAccountPermissionCatalogEntry,
  UpdateServiceAccount,
} from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import { ApiCollectionResponse, GetQueryByIdParams } from '../types';
import { GetServiceAccountsParams } from '../queries/service-accounts/use-get-service-accounts';
import { GetServiceAccountsStaticParams } from '../queries/service-accounts/use-get-service-account-by-id';

export class ServiceAccountsEndpoint {
  constructor(private client: ApiClient) {}

  async getServiceAccounts(
    params: GetServiceAccountsParams,
  ): Promise<ApiCollectionResponse<ServiceAccount>> {
    const { staticParams, fields, sort, offset = 0, limit = 20 } = params;
    return this.client.getCollection<ServiceAccount>(
      `/api/v1/organizations/${staticParams?.organizationId}/service-accounts`,
      fields,
      {
        offset,
        limit,
        sort,
      },
    );
  }

  async getServiceAccount(
    params: GetQueryByIdParams<ServiceAccount, GetServiceAccountsStaticParams>,
  ): Promise<ServiceAccount> {
    const { staticParams, id, fields } = params;
    return this.client.getById<ServiceAccount>(
      `/api/v1/organizations/${staticParams?.organizationId}/service-accounts/${id}`,
      fields,
    );
  }

  async getServiceAccountPermissionCatalog(
    organizationId: string,
  ): Promise<ServiceAccountPermissionCatalogEntry[]> {
    return this.client.getById<ServiceAccountPermissionCatalogEntry[]>(
      `/api/v1/organizations/${organizationId}/service-accounts/permission-catalog`,
    );
  }

  async createServiceAccount(
    organizationId: string,
    data: CreateServiceAccount,
  ): Promise<CreatedServiceAccount> {
    return this.client.post<CreatedServiceAccount>(
      `/api/v1/organizations/${organizationId}/service-accounts`,
      data,
    );
  }

  async updateServiceAccount(
    organizationId: string,
    serviceAccountId: string,
    updates: UpdateServiceAccount,
  ): Promise<ServiceAccount> {
    return this.client.patch<ServiceAccount>(
      `/api/v1/organizations/${organizationId}/service-accounts/${serviceAccountId}`,
      updates,
    );
  }

  async rotateServiceAccountSecret(
    organizationId: string,
    serviceAccountId: string,
  ): Promise<CreatedServiceAccount> {
    return this.client.post<CreatedServiceAccount>(
      `/api/v1/organizations/${organizationId}/service-accounts/${serviceAccountId}/rotate-secret`,
      {},
    );
  }

  async disableServiceAccount(
    organizationId: string,
    serviceAccountId: string,
  ): Promise<ServiceAccount> {
    return this.client.post<ServiceAccount>(
      `/api/v1/organizations/${organizationId}/service-accounts/${serviceAccountId}/disable`,
      {},
    );
  }

  async enableServiceAccount(
    organizationId: string,
    serviceAccountId: string,
  ): Promise<ServiceAccount> {
    return this.client.post<ServiceAccount>(
      `/api/v1/organizations/${organizationId}/service-accounts/${serviceAccountId}/enable`,
      {},
    );
  }

  async deleteServiceAccount(
    organizationId: string,
    serviceAccountId: string,
  ): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/organizations/${organizationId}/service-accounts/${serviceAccountId}`,
    );
  }
}
