import {
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CreateSubscription,
  ReadSubscription,
} from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
  GetQueryByIdParams,
} from '../types';

export interface GetSubscriptionsFilter {
  organizationId?: string;
}

export class SubscriptionsEndpoint {
  constructor(private client: ApiClient) {}

  async getSubscription(
    params: GetQueryByIdParams<ReadSubscription>,
  ): Promise<ReadSubscription> {
    return this.client.getById<ReadSubscription>(
      `/api/v1/subscriptions/${params.id}`,
      params.fields,
    );
  }

  async getSubscriptions(
    params: GetCollectionQueryParams<ReadSubscription, GetSubscriptionsFilter>,
  ): Promise<ApiCollectionResponse<ReadSubscription>> {
    const { fields, offset, limit, filters, staticParams, sort } = params;
    return this.client.getCollection<ReadSubscription>(
      '/api/v1/subscriptions',
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

  /**
   * Super admin: creates a subscription with collection_method=send_invoice
   * (Stripe emails the customer an invoice to pay).
   */
  async createSubscription(data: CreateSubscription): Promise<ReadSubscription> {
    return this.client.post<ReadSubscription>('/api/v1/subscriptions', data);
  }

  async createCheckoutSession(
    data: CheckoutSessionRequest,
  ): Promise<CheckoutSessionResponse> {
    return this.client.post<CheckoutSessionResponse>(
      '/api/v1/subscriptions/checkout-session',
      data,
    );
  }
}
