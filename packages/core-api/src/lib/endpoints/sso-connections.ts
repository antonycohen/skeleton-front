import {
  ReadSsoConnection,
  ReadSsoTestSignIn,
  SaveSsoConnection,
} from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import { FieldQuery } from '../types';

/**
 * The workspace's enterprise single sign-on connection. Singleton sub-resource: one at most per
 * organization, no id in the path. Workspace admins only (403 for editors and viewers), and 404
 * while the workspace is not entitled to SSO or SSO is switched off — a 404 on the GET also means
 * "no connection configured yet".
 *
 * The client secret is write-only: no response carries it, and leaving it out of a save keeps the
 * stored one. Changing the trust material (protocol, issuer, client id) sends the connection
 * back to `draft`, a new secret does not; the status itself only moves through the operations below, which
 * answer the connection in its default projection — callers read it back through the GET.
 */
export class SsoConnectionsEndpoint {
  constructor(private client: ApiClient) {}

  async getSsoConnection(
    organizationId: string,
    fields?: FieldQuery<ReadSsoConnection>,
  ): Promise<ReadSsoConnection> {
    return this.client.getById<ReadSsoConnection>(
      `/api/v1/organizations/${organizationId}/sso-connection`,
      fields,
    );
  }

  /** Creates the connection as a draft (201) or replaces it (200). The secret is required on creation. */
  async saveSsoConnection(
    organizationId: string,
    data: SaveSsoConnection,
  ): Promise<ReadSsoConnection> {
    return this.client.put<ReadSsoConnection>(
      `/api/v1/organizations/${organizationId}/sso-connection`,
      data,
    );
  }

  /** Partial update: settings leave the status alone, trust material returns the connection to draft. */
  async patchSsoConnection(
    organizationId: string,
    data: SaveSsoConnection,
  ): Promise<ReadSsoConnection> {
    return this.client.patch<ReadSsoConnection>(
      `/api/v1/organizations/${organizationId}/sso-connection`,
      data,
    );
  }

  /** 409 while the connection is enforced: lift the requirement first. */
  async deleteSsoConnection(organizationId: string): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/organizations/${organizationId}/sso-connection`,
    );
  }

  /**
   * SAML: reads the identity provider's metadata again from the connection's metadata URL and
   * applies it (entity id, sign-on address, certificates) — what an admin does once told that the
   * provider's certificates changed, since the scheduled re-read only reports. 409 (5506) without a
   * metadata URL, 422 (5511) when the document cannot be used.
   */
  async importSsoConnectionMetadata(
    organizationId: string,
  ): Promise<ReadSsoConnection> {
    return this.client.post<ReadSsoConnection>(
      `/api/v1/organizations/${organizationId}/sso-connection/metadata-import`,
    );
  }

  /**
   * Starts a test sign-in: the answer's `url` runs the real flow once, for ten minutes, signing
   * nobody in. 409 (5506) while the connection is enabled or enforced.
   */
  async startSsoConnectionTest(organizationId: string): Promise<ReadSsoTestSignIn> {
    return this.client.post<ReadSsoTestSignIn>(
      `/api/v1/organizations/${organizationId}/sso-connection/test`,
    );
  }

  /** `tested` to `enabled`. 409 (5506) when never tested, or without a verified domain. Idempotent. */
  async enableSsoConnection(organizationId: string): Promise<ReadSsoConnection> {
    return this.client.post<ReadSsoConnection>(
      `/api/v1/organizations/${organizationId}/sso-connection/enablement`,
    );
  }

  /** `enabled` back to `tested`. 409 (5502) while enforced. Idempotent. */
  async disableSsoConnection(organizationId: string): Promise<ReadSsoConnection> {
    return this.client.delete<ReadSsoConnection>(
      `/api/v1/organizations/${organizationId}/sso-connection/enablement`,
    );
  }

  /**
   * `enabled` to `enforced`. 409 (5506) while not enabled; 409 (5508) unless the caller's own
   * session was opened through this connection — its message is what the admin must read.
   */
  async enforceSsoConnection(organizationId: string): Promise<ReadSsoConnection> {
    return this.client.post<ReadSsoConnection>(
      `/api/v1/organizations/${organizationId}/sso-connection/enforcement`,
    );
  }

  /** `enforced` back to `enabled`. Idempotent. */
  async liftSsoEnforcement(organizationId: string): Promise<ReadSsoConnection> {
    return this.client.delete<ReadSsoConnection>(
      `/api/v1/organizations/${organizationId}/sso-connection/enforcement`,
    );
  }
}
