import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const grantSsoAvailabilityApi = vi.fn();
const withdrawSsoAvailabilityApi = vi.fn();

vi.mock('../../api', () => ({
  skeletonApi: {
    organizations: {
      grantSsoAvailability: (...args: unknown[]) => grantSsoAvailabilityApi(...args),
      withdrawSsoAvailability: (...args: unknown[]) => withdrawSsoAvailabilityApi(...args),
    },
  },
}));

const { useUpdateOrganizationSsoAvailability } = await import(
  './use-update-organization-sso-availability'
);

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';
const OTHER_ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000002';

let queryClient: QueryClient;

const renderUpdate = (
  options?: Parameters<typeof useUpdateOrganizationSsoAvailability>[0],
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useUpdateOrganizationSsoAvailability(options), { wrapper });
};

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
});

describe('useUpdateOrganizationSsoAvailability', () => {
  it('posts to make single sign-on available', async () => {
    grantSsoAvailabilityApi.mockResolvedValue({ id: ORGANIZATION_ID, ssoAvailable: true });

    const { result } = renderUpdate();
    const organization = await result.current.mutateAsync({
      organizationId: ORGANIZATION_ID,
      available: true,
    });

    expect(grantSsoAvailabilityApi).toHaveBeenCalledWith(ORGANIZATION_ID);
    expect(withdrawSsoAvailabilityApi).not.toHaveBeenCalled();
    expect(organization).toEqual({ id: ORGANIZATION_ID, ssoAvailable: true });
  });

  it('deletes the availability to withdraw it', async () => {
    withdrawSsoAvailabilityApi.mockResolvedValue({ id: ORGANIZATION_ID, ssoAvailable: false });

    const { result } = renderUpdate();
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, available: false });

    expect(withdrawSsoAvailabilityApi).toHaveBeenCalledWith(ORGANIZATION_ID);
    expect(grantSsoAvailabilityApi).not.toHaveBeenCalled();
  });

  // Granting the entitlement turns the 404s on the connection, the domains and the certificates
  // into real answers, so the whole SSO set follows — and only this workspace's.
  it('invalidates the organization, the workspace lists and the SSO reads of this workspace only', async () => {
    grantSsoAvailabilityApi.mockResolvedValue({ id: ORGANIZATION_ID, ssoAvailable: true });
    queryClient.setQueryData(['organization', ORGANIZATION_ID, { ssoAvailable: null }], {
      ssoAvailable: false,
    });
    queryClient.setQueryData(['organizations', {}], { data: [] });
    queryClient.setQueryData(['sso-connection', ORGANIZATION_ID, { status: null }], {
      status: 'draft',
    });
    queryClient.setQueryData(['sso-domains', ORGANIZATION_ID, {}], { data: [] });
    queryClient.setQueryData(['organization', OTHER_ORGANIZATION_ID, { ssoAvailable: null }], {
      ssoAvailable: false,
    });

    const { result } = renderUpdate();
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, available: true });

    await waitFor(() => {
      expect(
        queryClient.getQueryState(['organization', ORGANIZATION_ID, { ssoAvailable: null }])
          ?.isInvalidated,
      ).toBe(true);
      expect(queryClient.getQueryState(['organizations', {}])?.isInvalidated).toBe(true);
      expect(
        queryClient.getQueryState(['sso-connection', ORGANIZATION_ID, { status: null }])
          ?.isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(['sso-domains', ORGANIZATION_ID, {}])?.isInvalidated,
      ).toBe(true);
    });
    expect(
      queryClient.getQueryState(['organization', OTHER_ORGANIZATION_ID, { ssoAvailable: null }])
        ?.isInvalidated,
    ).toBe(false);
  });

  // Withdrawing it while the connection is enforced is a 409 whose message names the way out.
  it('invalidates nothing and surfaces the API message when the withdrawal is refused', async () => {
    const refusal = Object.assign(
      new Error('Lift the single sign-on requirement before withdrawing availability'),
      { httpCode: 409, errorCode: 5502 },
    );
    withdrawSsoAvailabilityApi.mockRejectedValue(refusal);
    queryClient.setQueryData(['organization', ORGANIZATION_ID, { ssoAvailable: null }], {
      ssoAvailable: true,
    });
    const onError = vi.fn();

    const { result } = renderUpdate({ onError });
    await expect(
      result.current.mutateAsync({ organizationId: ORGANIZATION_ID, available: false }),
    ).rejects.toBe(refusal);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe(refusal);
    expect(
      queryClient.getQueryState(['organization', ORGANIZATION_ID, { ssoAvailable: null }])
        ?.isInvalidated,
    ).toBe(false);
  });

  it('still runs a caller-supplied onSuccess', async () => {
    const onSuccess = vi.fn();
    grantSsoAvailabilityApi.mockResolvedValue({ id: ORGANIZATION_ID, ssoAvailable: true });

    const { result } = renderUpdate({ onSuccess });
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, available: true });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess.mock.calls[0][0]).toEqual({
      id: ORGANIZATION_ID,
      ssoAvailable: true,
    });
  });
});
