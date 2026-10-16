import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiClient } from '../api-client/api-client';
import { OrganizationsEndpoint } from './organizations';

const client = {
  post: vi.fn(),
  delete: vi.fn(),
};

const endpoint = new OrganizationsEndpoint(client as unknown as ApiClient);

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';

beforeEach(() => vi.clearAllMocks());

// The two calls the back-office SSO card makes. `SsoAvailabilityController` maps them on the
// workspace's `sso-availability` sub-resource and reads no body: an empty POST grants the
// entitlement, a DELETE withdraws it, and both answer the organization.
describe('OrganizationsEndpoint — SSO availability', () => {
  it('POSTs an empty body to grant the entitlement', async () => {
    client.post.mockResolvedValue({ id: ORGANIZATION_ID, ssoAvailable: true });

    const organization = await endpoint.grantSsoAvailability(ORGANIZATION_ID);

    expect(client.post).toHaveBeenCalledWith(
      `/api/v1/organizations/${ORGANIZATION_ID}/sso-availability`,
    );
    expect(organization).toEqual({ id: ORGANIZATION_ID, ssoAvailable: true });
  });

  it('DELETEs the same path to withdraw it', async () => {
    client.delete.mockResolvedValue({ id: ORGANIZATION_ID, ssoAvailable: false });

    await endpoint.withdrawSsoAvailability(ORGANIZATION_ID);

    expect(client.delete).toHaveBeenCalledWith(
      `/api/v1/organizations/${ORGANIZATION_ID}/sso-availability`,
    );
    expect(client.post).not.toHaveBeenCalled();
  });
});
