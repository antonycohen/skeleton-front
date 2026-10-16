import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const activateMfaApi = vi.fn();

vi.mock('../../api', () => ({
  skeletonApi: {
    users: {
      activateMfa: (...args: unknown[]) => activateMfaApi(...args),
    },
  },
}));

const { useActivateMfa } = await import('./use-activate-mfa');

const USER_ID = 'a2c8e4a0-0000-4000-8000-000000000001';
const RECOVERY = { recoveryCodes: ['abcde-fghjk', 'mnpqr-stvwx'] };

let queryClient: QueryClient;

const renderActivate = (options?: Parameters<typeof useActivateMfa>[0]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useActivateMfa(options), { wrapper });
};

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
});

describe('useActivateMfa', () => {
  it('posts the code for the user and hands back the recovery codes', async () => {
    activateMfaApi.mockResolvedValue(RECOVERY);

    const { result } = renderActivate();
    const codes = await result.current.mutateAsync({ userId: USER_ID, data: { code: '123456' } });

    expect(activateMfaApi).toHaveBeenCalledWith(USER_ID, { code: '123456' });
    expect(codes).toEqual(RECOVERY);
  });

  // The account page reads `mfaEnabled` from the user itself (keyed `[id, fields]`), the section
  // reads the status query, and workspace admins read `mfaEnabled` off the member list. All three
  // are projections of the same credential, so activation must refresh them without caller wiring.
  it('invalidates the status, the user, and the member lists', async () => {
    activateMfaApi.mockResolvedValue(RECOVERY);
    queryClient.setQueryData(['user', USER_ID, 'mfa'], { enabled: false });
    queryClient.setQueryData([USER_ID, { id: null }], { id: USER_ID, mfaEnabled: false });
    queryClient.setQueryData(['organization-members', 'org-1', {}], { data: [] });
    queryClient.setQueryData(['organizations', 'org-1'], { id: 'org-1' });

    const { result } = renderActivate();
    await result.current.mutateAsync({ userId: USER_ID, data: { code: '123456' } });

    await waitFor(() => {
      expect(queryClient.getQueryState(['user', USER_ID, 'mfa'])?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState([USER_ID, { id: null }])?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(['organization-members', 'org-1', {}])?.isInvalidated).toBe(true);
    });
    expect(queryClient.getQueryState(['organizations', 'org-1'])?.isInvalidated).toBe(false);
  });

  it('still runs a caller-supplied onSuccess', async () => {
    const onSuccess = vi.fn();
    activateMfaApi.mockResolvedValue(RECOVERY);

    const { result } = renderActivate({ onSuccess });
    await result.current.mutateAsync({ userId: USER_ID, data: { code: '123456' } });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess.mock.calls[0][0]).toEqual(RECOVERY);
  });
});
