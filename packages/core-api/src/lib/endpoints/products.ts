import {
  CreateProduct,
  MoveProductsOperation,
  ReadProduct,
  UpdateProduct,
} from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
  GetQueryByIdParams,
} from '../types';

export class ProductsEndpoint {
  constructor(private client: ApiClient) {}

  async getProduct(params: GetQueryByIdParams<ReadProduct>): Promise<ReadProduct> {
    return this.client.getById<ReadProduct>(
      `/api/v1/products/${params.id}`,
      params.fields,
    );
  }

  async getProducts(
    params: GetCollectionQueryParams<ReadProduct>,
  ): Promise<ApiCollectionResponse<ReadProduct>> {
    const { fields, offset, limit, filters } = params;
    return this.client.getCollection<ReadProduct>('/api/v1/products', fields, {
      offset,
      limit,
      ...filters,
    });
  }

  async createProduct(data: CreateProduct): Promise<ReadProduct> {
    return this.client.post<ReadProduct>('/api/v1/products', data);
  }

  async updateProduct(id: string, data: UpdateProduct): Promise<ReadProduct> {
    return this.client.put<ReadProduct>(`/api/v1/products/${id}`, data);
  }

  async repositionProducts(
    productGroupId: string,
    operation: MoveProductsOperation,
  ): Promise<void> {
    await this.client.post<void>(
      `/api/v1/product-groups/${productGroupId}/reposition-products`,
      operation,
    );
  }
}
