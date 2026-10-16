import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadSsoConnection } from '@skeleton/core-api-models';

const startTestMutate = vi.fn();
const invalidateSsoQueriesMock = vi.fn();
let testMutationOptions:
  | { onSuccess?: (data: { url: string | null }) => void; onError?: (error: unknown) => void }
  | undefined;

vi.mock('@skeleton/core-api', () => ({
  invalidateSsoQueries: (...args: unknown[]) => invalidateSsoQueriesMock(...args),
  useStartSsoConnectionTest: (options: typeof testMutationOptions) => {
    testMutationOptions = options;
    return { mutate: startTestMutate, isPending: false };
  },
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const { useSsoTestSignIn } = await import('./use-sso-test-sign-in');

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';
const POLL_MS = 500;
const TEN_MINUTES_MS = 10 * 60 * 1000;

const connection = (
  status: string,
  lastTestedAt: string | null = null,
): Pick<ReadSsoConnection, 'status' | 'lastTestedAt'> =>
  ({ status, lastTestedAt }) as Pick<ReadSsoConnection, 'status' | 'lastTestedAt'>;

/** The popup the browser hands back. `closed` is what an opener-severing provider lies about. */
const popupStub = (closed = false) => ({ closed });

const renderTestSignIn = (
  initialConnection: Pick<ReadSsoConnection, 'status' | 'lastTestedAt'> | undefined = connection(
    'draft',
  ),
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(
    ({ current }: { current: Pick<ReadSsoConnection, 'status' | 'lastTestedAt'> | undefined }) =>
      useSsoTestSignIn(ORGANIZATION_ID, current),
    { wrapper, initialProps: { current: initialConnection } },
  );
};

/** Starts the test and answers the mutation with the API's one-time link. */
const openPopup = (popup: { closed: boolean } | null) => {
  vi.stubGlobal(
    'open',
    vi.fn(() => popup),
  );
  act(() => {
    testMutationOptions?.onSuccess?.({ url: 'https://api.example.test/login/sso/test?token=abc' });
  });
};

const comeBackToTheApp = () => act(() => void fireEvent(window, new Event('focus')));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  testMutationOptions = undefined;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useSsoTestSignIn', () => {
  it('asks the API for a link and opens it in a popup', () => {
    const { result } = renderTestSignIn();

    act(() => result.current.startTest());
    expect(startTestMutate).toHaveBeenCalledWith({ organizationId: ORGANIZATION_ID });

    openPopup(popupStub());
    expect(result.current.isTesting).toBe(true);
    expect(invalidateSsoQueriesMock).not.toHaveBeenCalled();
  });

  it('reads the connection again once the popup is closed', () => {
    const popup = popupStub();
    const { result } = renderTestSignIn();
    openPopup(popup);

    act(() => void vi.advanceTimersByTime(POLL_MS));
    expect(invalidateSsoQueriesMock).not.toHaveBeenCalled();

    popup.closed = true;
    act(() => void vi.advanceTimersByTime(POLL_MS));

    expect(invalidateSsoQueriesMock).toHaveBeenCalledWith(expect.anything(), ORGANIZATION_ID);
    expect(result.current.isTesting).toBe(false);
  });

  // An identity provider answering `Cross-Origin-Opener-Policy: same-origin` severs the opener
  // relation, and `closed` then reads `true` while the admin is still signing in. The button must
  // not stay stuck, and coming back to the app is what really says the test is over.
  describe('when the provider severs the opener relation', () => {
    it('stops spinning at once and still reads the connection when the admin comes back', () => {
      const { result } = renderTestSignIn();
      openPopup(popupStub(true));

      act(() => void vi.advanceTimersByTime(POLL_MS));
      expect(result.current.isTesting).toBe(false);
      invalidateSsoQueriesMock.mockClear();

      comeBackToTheApp();

      expect(invalidateSsoQueriesMock).toHaveBeenCalledWith(expect.anything(), ORGANIZATION_ID);
    });

    it('keeps reading on every return until the connection is seen to change', () => {
      const { rerender } = renderTestSignIn();
      openPopup(popupStub(true));
      act(() => void vi.advanceTimersByTime(POLL_MS));

      comeBackToTheApp();
      comeBackToTheApp();
      expect(invalidateSsoQueriesMock.mock.calls.length).toBeGreaterThanOrEqual(2);

      // The test succeeded: the connection is `tested` and stamped.
      rerender({ current: connection('tested', '2026-09-22T09:00:00Z') });
      invalidateSsoQueriesMock.mockClear();

      comeBackToTheApp();

      expect(invalidateSsoQueriesMock).not.toHaveBeenCalled();
    });

    it('gives up once the link cannot be used any more', () => {
      renderTestSignIn();
      openPopup(popupStub(true));
      act(() => void vi.advanceTimersByTime(POLL_MS));
      invalidateSsoQueriesMock.mockClear();

      act(() => void vi.advanceTimersByTime(TEN_MINUTES_MS));
      comeBackToTheApp();

      expect(invalidateSsoQueriesMock).not.toHaveBeenCalled();
    });
  });

  it('watches nothing when the popup was blocked', () => {
    const { result } = renderTestSignIn();
    openPopup(null);

    expect(result.current.isTesting).toBe(false);
    comeBackToTheApp();
    act(() => void vi.advanceTimersByTime(POLL_MS));

    expect(invalidateSsoQueriesMock).not.toHaveBeenCalled();
  });

  it('leaves no listener nor timer behind when the page is left', () => {
    const { unmount } = renderTestSignIn();
    openPopup(popupStub());

    unmount();
    invalidateSsoQueriesMock.mockClear();

    comeBackToTheApp();
    act(() => void vi.advanceTimersByTime(TEN_MINUTES_MS));

    expect(invalidateSsoQueriesMock).not.toHaveBeenCalled();
  });
});
