import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ApiError, User } from '@skeleton/core-api-models';

const reset = vi.fn();
const oauthState = { accessToken: 'token' as string | null, reset };

vi.mock('@skeleton/core-store-oauth', () => ({
  useOAuthStore: (selector: (state: typeof oauthState) => unknown) => selector(oauthState),
  useUserIdFromToken: () => 'user-1',
}));

/** What `useGetUserById` returns on the next render; the specs drive it like the query would. */
let userQuery: {
  data?: User;
  error?: ApiError | null;
  isLoading: boolean;
  isFetched: boolean;
};

vi.mock('@skeleton/core-api', () => ({
  useGetUserById: () => userQuery,
}));

const { useSetupSessionUser } = await import('./use-setup-session-user');
const { useSessionStore } = await import('../../store/session-store');

const user = { id: 'user-1', email: 'jane@example.com' } as User;
const failed = (error: Partial<ApiError>) => ({
  error: error as ApiError,
  isLoading: false,
  isFetched: true,
});

describe('useSetupSessionUser', () => {
  beforeEach(() => {
    // The "still loading" shape: a case that forgets to drive the query asserts on nothing
    userQuery = { error: null, isLoading: true, isFetched: false };
    reset.mockClear();
    oauthState.accessToken = 'token';
    useSessionStore.setState({ connectedUser: null, error: null });
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([401, 403])('drops the token when the API refuses it with a %i', (httpCode) => {
    userQuery = failed({ httpCode });

    renderHook(() => useSetupSessionUser());

    expect(reset).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().error).toEqual({ httpCode });
  });

  const transientFailures: Array<[string, Partial<ApiError>]> = [
    ['a 5xx', { httpCode: 503 }],
    ['a network error (no HTTP code)', { error: 'Network Error' }],
  ];

  it.each(transientFailures)('keeps the token on %s and only records the session error', (_label, error) => {
    userQuery = failed(error);

    renderHook(() => useSetupSessionUser());

    expect(reset).not.toHaveBeenCalled();
    expect(useSessionStore.getState().error).toEqual(error);
    expect(useSessionStore.getState().connectedUser).toBeNull();
  });

  it('sets the connected user and clears an earlier session error on success', () => {
    userQuery = failed({ httpCode: 503 });
    const { rerender } = renderHook(() => useSetupSessionUser());
    expect(useSessionStore.getState().error).toEqual({ httpCode: 503 });

    userQuery = { data: user, error: null, isLoading: false, isFetched: true };
    rerender();

    expect(useSessionStore.getState().connectedUser).toEqual(user);
    expect(useSessionStore.getState().error).toBeNull();
    expect(reset).not.toHaveBeenCalled();
  });

  it('drops the token when the query settles with no user and no error', () => {
    userQuery = { data: undefined, error: null, isLoading: false, isFetched: true };

    renderHook(() => useSetupSessionUser());

    expect(reset).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().error).toBeNull();
    expect(useSessionStore.getState().connectedUser).toBeNull();
  });

  it('does nothing while the user is still loading', () => {
    renderHook(() => useSetupSessionUser());

    expect(reset).not.toHaveBeenCalled();
    expect(useSessionStore.getState().error).toBeNull();
    expect(useSessionStore.getState().connectedUser).toBeNull();
  });
});
