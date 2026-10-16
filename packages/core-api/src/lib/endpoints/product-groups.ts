import {
  CreateProductGroup,
  ReadProductGroup,
  UpdateProductGroup,
} from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
  GetQueryByIdParams,
} from '../types';

export class ProductGroupsEndpoint {
  constructor(private client: ApiClient) {}

  /**
   * Anonymous read for the pricing page and the paywall. The server ignores `fields` and always
   * serves the same fixed graph, and only active groups; the back office reads through
   * {@link getAdminProductGroup} instead.
   */
  async getProductGroup(
    params: GetQueryByIdParams<ReadProductGroup>,
  ): Promise<ReadProductGroup> {
    return this.client.getById<ReadProductGroup>(
      `/api/v1/public/product-groups/${params.id}`,
      params.fields,
    );
  }

  /** Authenticated read: any field graph, inactive groups included. */
  async getAdminProductGroup(
    params: GetQueryByIdParams<ReadProductGroup>,
  ): Promise<ReadProductGroup> {
    return this.client.getById<ReadProductGroup>(
      `/api/v1/product-groups/${params.id}`,
      params.fields,
    );
  }

  async getProductGroups(
    params: GetCollectionQueryParams<ReadProductGroup>,
  ): Promise<ApiCollectionResponse<ReadProductGroup>> {
    const { fields, offset, limit, filters } = params;
    return this.client.getCollection<ReadProductGroup>(
      '/api/v1/product-groups',
      fields,
      {
        offset,
        limit,
        ...filters,
      },
    );
  }

  async createProductGroup(data: CreateProductGroup): Promise<ReadProductGroup> {
    return this.client.post<ReadProductGroup>('/api/v1/product-groups', data);
  }

  async updateProductGroup(
    id: string,
    data: UpdateProductGroup,
  ): Promise<ReadProductGroup> {
    return this.client.put<ReadProductGroup>(
      `/api/v1/product-groups/${id}`,
      data,
    );
  }
}
