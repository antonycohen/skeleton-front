import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const enforceSsoConnectionApi = vi.fn();
const liftSsoEnforcementApi = vi.fn();

vi.mock('../../api', () => ({
  skeletonApi: {
    ssoConnections: {
      enforceSsoConnection: (...args: unknown[]) => enforceSsoConnectionApi(...args),
      liftSsoEnforcement: (...args: unknown[]) => liftSsoEnforcementApi(...args),
    },
  },
}));

const { useUpdateSsoConnectionEnforcement } = await import(
  './use-update-sso-connection-enforcement'
);

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';
const OTHER_ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000002';

let queryClient: QueryClient;

const renderUpdate = (
  options?: Parameters<typeof useUpdateSsoConnectionEnforcement>[0],
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useUpdateSsoConnectionEnforcement(options), { wrapper });
};

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
});

describe('useUpdateSsoConnectionEnforcement', () => {
  it('posts to require single sign-on', async () => {
    enforceSsoConnectionApi.mockResolvedValue({ id: 'c1', status: 'enforced' });

    const { result } = renderUpdate();
    const connection = await result.current.mutateAsync({
      organizationId: ORGANIZATION_ID,
      enforced: true,
    });

    expect(enforceSsoConnectionApi).toHaveBeenCalledWith(ORGANIZATION_ID);
    expect(liftSsoEnforcementApi).not.toHaveBeenCalled();
    expect(connection).toEqual({ id: 'c1', status: 'enforced' });
  });

  it('deletes the enforcement to lift it', async () => {
    liftSsoEnforcementApi.mockResolvedValue({ id: 'c1', status: 'enabled' });

    const { result } = renderUpdate();
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, enforced: false });

    expect(liftSsoEnforcementApi).toHaveBeenCalledWith(ORGANIZATION_ID);
    expect(enforceSsoConnectionApi).not.toHaveBeenCalled();
  });

  // The status card reads the connection, the domains card the domains, and both the security page
  // and the back office read `ssoAvailable` off the organization: all of them must follow the
  // switch without caller wiring, and no other workspace's cache may be touched.
  it('invalidates the connection, the domains and the organization of this workspace only', async () => {
    enforceSsoConnectionApi.mockResolvedValue({ id: 'c1', status: 'enforced' });
    queryClient.setQueryData(['sso-connection', ORGANIZATION_ID, { status: null }], {
      status: 'enabled',
    });
    queryClient.setQueryData(['sso-domains', ORGANIZATION_ID, {}], { data: [] });
    queryClient.setQueryData(['organization', ORGANIZATION_ID, { ssoAvailable: null }], {
      ssoAvailable: true,
    });
    queryClient.setQueryData(['organizations', {}], { data: [] });
    queryClient.setQueryData(['sso-connection', OTHER_ORGANIZATION_ID, { status: null }], {
      status: 'draft',
    });

    const { result } = renderUpdate();
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, enforced: true });

    await waitFor(() => {
      expect(
        queryClient.getQueryState(['sso-connection', ORGANIZATION_ID, { status: null }])
          ?.isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(['sso-domains', ORGANIZATION_ID, {}])?.isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(['organization', ORGANIZATION_ID, { ssoAvailable: null }])
          ?.isInvalidated,
      ).toBe(true);
      expect(queryClient.getQueryState(['organizations', {}])?.isInvalidated).toBe(true);
    });
    expect(
      queryClient.getQueryState(['sso-connection', OTHER_ORGANIZATION_ID, { status: null }])
        ?.isInvalidated,
    ).toBe(false);
  });

  it('invalidates nothing and surfaces the API message when the session did not come through the connection', async () => {
    const refusal = Object.assign(
      new Error('Sign in through your identity provider first, then come back'),
      { httpCode: 409, errorCode: 5508 },
    );
    enforceSsoConnectionApi.mockRejectedValue(refusal);
    queryClient.setQueryData(['sso-connection', ORGANIZATION_ID, { status: null }], {
      status: 'enabled',
    });
    const onError = vi.fn();

    const { result } = renderUpdate({ onError });
    await expect(
      result.current.mutateAsync({ organizationId: ORGANIZATION_ID, enforced: true }),
    ).rejects.toBe(refusal);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe(refusal);
    expect(
      queryClient.getQueryState(['sso-connection', ORGANIZATION_ID, { status: null }])
        ?.isInvalidated,
    ).toBe(false);
  });

  it('still runs a caller-supplied onSuccess', async () => {
    const onSuccess = vi.fn();
    enforceSsoConnectionApi.mockResolvedValue({ id: 'c1', status: 'enforced' });

    const { result } = renderUpdate({ onSuccess });
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, enforced: true });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess.mock.calls[0][0]).toEqual({ id: 'c1', status: 'enforced' });
  });
});
