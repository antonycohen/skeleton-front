import { CreatePrice, ReadPrice, UpdatePrice } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
  GetQueryByIdParams,
} from '../types';

export interface GetPricesFilter {
  productId?: string;
  organizationType?: string;
}

export class PricesEndpoint {
  constructor(private client: ApiClient) {}

  async getPrice(params: GetQueryByIdParams<ReadPrice>): Promise<ReadPrice> {
    return this.client.getById<ReadPrice>(
      `/api/v1/prices/${params.id}`,
      params.fields,
    );
  }

  async getPrices(
    params: GetCollectionQueryParams<ReadPrice, GetPricesFilter>,
  ): Promise<ApiCollectionResponse<ReadPrice>> {
    const { fields, offset, limit, filters, staticParams } = params;
    return this.client.getCollection<ReadPrice>('/api/v1/prices', fields, {
      offset,
      limit,
      ...filters,
      ...staticParams,
    });
  }

  async createPrice(data: CreatePrice): Promise<ReadPrice> {
    return this.client.post<ReadPrice>('/api/v1/prices', data);
  }

  async updatePrice(id: string, data: UpdatePrice): Promise<ReadPrice> {
    return this.client.put<ReadPrice>(`/api/v1/prices/${id}`, data);
  }
}
