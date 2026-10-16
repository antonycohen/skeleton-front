import {
  CustomerPortalSessionRequest,
  CustomerPortalSessionResponse,
} from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';

export class CustomerPortalEndpoint {
  constructor(private client: ApiClient) {}

  async createPortalSession(
    data: CustomerPortalSessionRequest,
  ): Promise<CustomerPortalSessionResponse> {
    return this.client.post<CustomerPortalSessionResponse>(
      '/api/v1/customer-portal/sessions',
      data,
    );
  }

  async createPaymentMethodUpdateSession(
    data: CustomerPortalSessionRequest,
  ): Promise<CustomerPortalSessionResponse> {
    return this.client.post<CustomerPortalSessionResponse>(
      '/api/v1/customer-portal/sessions/payment-method-update',
      data,
    );
  }

  async createSubscriptionCancelSession(
    data: CustomerPortalSessionRequest,
  ): Promise<CustomerPortalSessionResponse> {
    return this.client.post<CustomerPortalSessionResponse>(
      '/api/v1/customer-portal/sessions/subscription-cancel',
      data,
    );
  }

  async createSubscriptionUpdateSession(
    data: CustomerPortalSessionRequest,
  ): Promise<CustomerPortalSessionResponse> {
    return this.client.post<CustomerPortalSessionResponse>(
      '/api/v1/customer-portal/sessions/subscription-update',
      data,
    );
  }
}
