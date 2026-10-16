import { ReadQuotaTransaction } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
  GetQueryByIdParams,
} from '../types';

export interface GetQuotaTransactionsFilter {
  organizationId?: string;
  quotaId?: string;
}

export class QuotaTransactionsEndpoint {
  constructor(private client: ApiClient) {}

  async getQuotaTransaction(
    params: GetQueryByIdParams<ReadQuotaTransaction>,
  ): Promise<ReadQuotaTransaction> {
    return this.client.getById<ReadQuotaTransaction>(
      `/api/v1/quota-transactions/${params.id}`,
      params.fields,
    );
  }

  async getQuotaTransactions(
    params: GetCollectionQueryParams<
      ReadQuotaTransaction,
      GetQuotaTransactionsFilter
    >,
  ): Promise<ApiCollectionResponse<ReadQuotaTransaction>> {
    const { fields, offset, limit, filters, staticParams, sort } = params;
    return this.client.getCollection<ReadQuotaTransaction>(
      '/api/v1/quota-transactions',
      fields,
      {
        offset,
        limit,
        ...filters,
        ...staticParams,
        sort,
      },
    );
  }
}
