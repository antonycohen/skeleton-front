import { ReadCustomer } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
  GetQueryByIdParams,
} from '../types';

export class CustomersEndpoint {
  constructor(private client: ApiClient) {}

  async getCustomer(
    params: GetQueryByIdParams<ReadCustomer>,
  ): Promise<ReadCustomer> {
    return this.client.getById<ReadCustomer>(
      `/api/v1/customers/${params.id}`,
      params.fields,
    );
  }

  async getCustomers(
    params: GetCollectionQueryParams<ReadCustomer>,
  ): Promise<ApiCollectionResponse<ReadCustomer>> {
    const { fields, offset, limit, filters } = params;
    return this.client.getCollection<ReadCustomer>('/api/v1/customers', fields, {
      offset,
      limit,
      ...filters,
    });
  }
}
