import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const requireMfaApi = vi.fn();
const liftMfaRequirementApi = vi.fn();

vi.mock('../../api', () => ({
  skeletonApi: {
    organizations: {
      requireMfa: (...args: unknown[]) => requireMfaApi(...args),
      liftMfaRequirement: (...args: unknown[]) => liftMfaRequirementApi(...args),
    },
  },
}));

const { useUpdateOrganizationMfaRequirement } = await import(
  './use-update-organization-mfa-requirement'
);

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';
const OTHER_ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000002';
const USER_ID = 'a2c8e4a0-0000-4000-8000-000000000001';

let queryClient: QueryClient;

const renderUpdate = (
  options?: Parameters<typeof useUpdateOrganizationMfaRequirement>[0],
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useUpdateOrganizationMfaRequirement(options), { wrapper });
};

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
});

describe('useUpdateOrganizationMfaRequirement', () => {
  it('posts to require two-factor authentication', async () => {
    requireMfaApi.mockResolvedValue({ id: ORGANIZATION_ID, mfaRequired: true });

    const { result } = renderUpdate();
    const organization = await result.current.mutateAsync({
      organizationId: ORGANIZATION_ID,
      required: true,
    });

    expect(requireMfaApi).toHaveBeenCalledWith(ORGANIZATION_ID);
    expect(liftMfaRequirementApi).not.toHaveBeenCalled();
    expect(organization).toEqual({ id: ORGANIZATION_ID, mfaRequired: true });
  });

  it('deletes the requirement to lift it', async () => {
    liftMfaRequirementApi.mockResolvedValue({ id: ORGANIZATION_ID, mfaRequired: false });

    const { result } = renderUpdate();
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, required: false });

    expect(liftMfaRequirementApi).toHaveBeenCalledWith(ORGANIZATION_ID);
    expect(requireMfaApi).not.toHaveBeenCalled();
  });

  // The settings page and the back-office profile tab read `mfaRequired` off the organization
  // (keyed `['organization', id, fields]`), and the account page reads `required` off the user's
  // own status: all of them must follow the switch without caller wiring.
  it('invalidates the organization, the organization lists and the MFA statuses', async () => {
    requireMfaApi.mockResolvedValue({ id: ORGANIZATION_ID, mfaRequired: true });
    queryClient.setQueryData(['organization', ORGANIZATION_ID, { mfaRequired: null }], {
      mfaRequired: false,
    });
    queryClient.setQueryData(['organization', OTHER_ORGANIZATION_ID, { mfaRequired: null }], {
      mfaRequired: false,
    });
    queryClient.setQueryData(['organizations', {}], { data: [] });
    queryClient.setQueryData(['user', USER_ID, 'mfa'], { enabled: true, required: false });
    queryClient.setQueryData(['organization-members', ORGANIZATION_ID, {}], { data: [] });

    const { result } = renderUpdate();
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, required: true });

    await waitFor(() => {
      expect(
        queryClient.getQueryState(['organization', ORGANIZATION_ID, { mfaRequired: null }])
          ?.isInvalidated,
      ).toBe(true);
      expect(queryClient.getQueryState(['organizations', {}])?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(['user', USER_ID, 'mfa'])?.isInvalidated).toBe(true);
    });
    expect(
      queryClient.getQueryState(['organization', OTHER_ORGANIZATION_ID, { mfaRequired: null }])
        ?.isInvalidated,
    ).toBe(false);
    expect(
      queryClient.getQueryState(['organization-members', ORGANIZATION_ID, {}])?.isInvalidated,
    ).toBe(false);
  });

  it('invalidates nothing and surfaces the API error when the switch is refused', async () => {
    const refusal = Object.assign(new Error('Enable two-factor authentication on your own account'), {
      httpCode: 409,
      errorCode: 5204,
    });
    requireMfaApi.mockRejectedValue(refusal);
    queryClient.setQueryData(['organization', ORGANIZATION_ID, { mfaRequired: null }], {
      mfaRequired: false,
    });
    const onError = vi.fn();

    const { result } = renderUpdate({ onError });
    await expect(
      result.current.mutateAsync({ organizationId: ORGANIZATION_ID, required: true }),
    ).rejects.toBe(refusal);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe(refusal);
    expect(
      queryClient.getQueryState(['organization', ORGANIZATION_ID, { mfaRequired: null }])
        ?.isInvalidated,
    ).toBe(false);
  });

  it('still runs a caller-supplied onSuccess', async () => {
    const onSuccess = vi.fn();
    requireMfaApi.mockResolvedValue({ id: ORGANIZATION_ID, mfaRequired: true });

    const { result } = renderUpdate({ onSuccess });
    await result.current.mutateAsync({ organizationId: ORGANIZATION_ID, required: true });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess.mock.calls[0][0]).toEqual({ id: ORGANIZATION_ID, mfaRequired: true });
  });
});
