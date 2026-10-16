import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { ApiError } from '@skeleton/core-api-models';
// Static on purpose: a dynamic `import()` of a workspace package marks it lazy-loaded for Nx,
// which then forbids the static imports the sources make.
import { useSessionStore } from '@skeleton/core-store-session';

const getAuthorizationUrl = vi.fn();

vi.mock('@skeleton/core-api', () => ({
  getAuthorizationUrl: (...args: unknown[]) => getAuthorizationUrl(...args),
}));

const { LoginPage } = await import('./login-page');

/** The page reads window.location itself; a hash URL keeps jsdom's navigation stub quiet. */
const renderLogin = (search: string) => {
  window.history.replaceState({}, '', `/login${search}`);
  getAuthorizationUrl.mockResolvedValue(`${window.location.href}#authorize`);
  return render(<LoginPage />);
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({ error: null });
  });

  it('forwards the query minus the parameters the authorization request owns', async () => {
    renderLogin('?login_hint=jane%40example.com&error=access_denied&error_description=x&state=s');

    await waitFor(() =>
      expect(getAuthorizationUrl).toHaveBeenCalledWith({ login_hint: 'jane@example.com' })
    );
    await waitFor(() => expect(window.location.hash).toBe('#authorize'));
  });

  it('passes no extra parameters for a bare /login', async () => {
    renderLogin('');

    await waitFor(() => expect(getAuthorizationUrl).toHaveBeenCalledWith(undefined));
  });

  it('redirects once, whatever the re-renders', async () => {
    const { rerender } = renderLogin('?login_hint=jane%40example.com');
    rerender(<LoginPage />);
    rerender(<LoginPage />);

    await waitFor(() => expect(window.location.hash).toBe('#authorize'));
    expect(getAuthorizationUrl).toHaveBeenCalledTimes(1);
  });

  it('clears a previous session error before starting a fresh login', () => {
    useSessionStore.setState({ error: { httpCode: 403 } as ApiError });

    renderLogin('');

    expect(useSessionStore.getState().error).toBeNull();
  });
});
