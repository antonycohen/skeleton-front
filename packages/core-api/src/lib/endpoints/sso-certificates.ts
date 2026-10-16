import { CreateSsoCertificate, ReadSsoCertificate } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import { ApiCollectionResponse, GetCollectionQueryParams } from '../types';

export interface GetSsoCertificatesStaticFilter {
  organizationId: string;
}

/**
 * The signing certificates of a workspace's SAML connection: at most two, so that the identity
 * provider's certificate can be rotated without an outage — add the new one, switch the provider,
 * remove the old one. Same permissions and same 404 as the connection.
 *
 * Adding a second certificate leaves the connection's status alone; removing the last valid one is
 * a trust change: the connection returns to draft and the requirement is lifted.
 */
export class SsoCertificatesEndpoint {
  constructor(private client: ApiClient) {}

  async getSsoCertificates(
    params: GetCollectionQueryParams<
      ReadSsoCertificate,
      GetSsoCertificatesStaticFilter
    >,
  ): Promise<ApiCollectionResponse<ReadSsoCertificate>> {
    const { staticParams, fields, offset, limit, filters } = params;
    return this.client.getCollection<ReadSsoCertificate>(
      `/api/v1/organizations/${staticParams?.organizationId}/sso-connection/certificates`,
      fields,
      { offset, limit, ...filters },
    );
  }

  /**
   * Registers a certificate (PEM). 422 (5509) when it is not acceptable — not X.509, RSA below
   * 2048 bits, signed with SHA-1 or MD5, expired; 409 (5510) when the connection already holds two,
   * or holds that one.
   */
  async addSsoCertificate(
    organizationId: string,
    data: CreateSsoCertificate,
  ): Promise<ReadSsoCertificate> {
    return this.client.post<ReadSsoCertificate>(
      `/api/v1/organizations/${organizationId}/sso-connection/certificates`,
      data,
    );
  }

  async deleteSsoCertificate(
    organizationId: string,
    certificateId: string,
  ): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/organizations/${organizationId}/sso-connection/certificates/${certificateId}`,
    );
  }
}
