import { AdjustQuota, ReadQuota } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
  GetQueryByIdParams,
} from '../types';

export interface GetQuotasFilter {
  organizationId?: string;
}

export class QuotasEndpoint {
  constructor(private client: ApiClient) {}

  async getQuota(params: GetQueryByIdParams<ReadQuota>): Promise<ReadQuota> {
    return this.client.getById<ReadQuota>(
      `/api/v1/quotas/${params.id}`,
      params.fields,
    );
  }

  async getQuotas(
    params: GetCollectionQueryParams<ReadQuota, GetQuotasFilter>,
  ): Promise<ApiCollectionResponse<ReadQuota>> {
    const { fields, offset, limit, filters, staticParams, sort } = params;
    return this.client.getCollection<ReadQuota>('/api/v1/quotas', fields, {
      offset,
      limit,
      ...filters,
      ...staticParams,
      sort,
    });
  }

  /**
   * Adjusts an organization's quota for a feature: its limit by a signed amount
   * (positive grants credits, negative revokes them) and/or the end of its current
   * period. Admin-only, and deliberately not under `/quotas/:id` — the backend
   * addresses the quota by organization + feature key. The path still says
   * `quota-credits` for the same reason.
   */
  async adjustQuota(
    organizationId: string,
    adjustment: AdjustQuota,
  ): Promise<ReadQuota> {
    return this.client.post<ReadQuota>(
      `/api/v1/admin/organizations/${organizationId}/quota-credits`,
      adjustment,
    );
  }
}
