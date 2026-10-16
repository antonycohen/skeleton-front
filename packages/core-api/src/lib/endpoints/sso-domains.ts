import { CreateSsoDomain, ReadSsoDomain } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
} from '../types';

export interface GetSsoDomainsStaticFilter {
  organizationId: string;
}

/**
 * The e-mail domains a workspace claims for single sign-on, each proven by a DNS TXT record. Same
 * permissions and same 404 as the connection. A domain is added and verified, never updated.
 */
export class SsoDomainsEndpoint {
  constructor(private client: ApiClient) {}

  async getSsoDomains(
    params: GetCollectionQueryParams<ReadSsoDomain, GetSsoDomainsStaticFilter>,
  ): Promise<ApiCollectionResponse<ReadSsoDomain>> {
    const { staticParams, fields, offset, limit, filters } = params;
    return this.client.getCollection<ReadSsoDomain>(
      `/api/v1/organizations/${staticParams?.organizationId}/sso-domains`,
      fields,
      { offset, limit, ...filters },
    );
  }

  /**
   * Adds a domain: the answer carries the TXT record to publish. 422 (5503) for a public e-mail
   * provider, a public suffix or what is not a domain; 409 when this or another workspace holds it.
   */
  async createSsoDomain(
    organizationId: string,
    data: CreateSsoDomain,
  ): Promise<ReadSsoDomain> {
    return this.client.post<ReadSsoDomain>(
      `/api/v1/organizations/${organizationId}/sso-domains`,
      data,
    );
  }

  /**
   * Checks the DNS now. 200 verified; 422 (5504) the record is not visible yet; 503 (5505) the DNS
   * did not answer. The message is what the admin needs to read, so callers surface it as it comes.
   */
  async verifySsoDomain(
    organizationId: string,
    domainId: string,
  ): Promise<ReadSsoDomain> {
    return this.client.post<ReadSsoDomain>(
      `/api/v1/organizations/${organizationId}/sso-domains/${domainId}/verification`,
    );
  }

  /** Removes a domain. The last verified one returns an enabled or enforced connection to `tested`. */
  async deleteSsoDomain(organizationId: string, domainId: string): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/organizations/${organizationId}/sso-domains/${domainId}`,
    );
  }
}
