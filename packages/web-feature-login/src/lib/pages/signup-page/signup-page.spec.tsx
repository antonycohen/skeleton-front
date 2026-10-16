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

const { SignupPage } = await import('./signup-page');

/** The page reads window.location itself; a hash URL keeps jsdom's navigation stub quiet. */
const renderSignup = (search: string) => {
  window.history.replaceState({}, '', `/signup${search}`);
  getAuthorizationUrl.mockResolvedValue(`${window.location.href}#authorize`);
  return render(<SignupPage />);
};

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({ error: null });
  });

  it('forwards the query to the authorization request and keeps the register flag', async () => {
    renderSignup('?login_hint=jane%40example.com&error=access_denied&state=x');

    await waitFor(() =>
      expect(getAuthorizationUrl).toHaveBeenCalledWith({
        login_hint: 'jane@example.com',
        register: '1',
      })
    );
    await waitFor(() => expect(window.location.hash).toBe('#authorize'));
  });

  it('never lets the query override the register flag', async () => {
    renderSignup('?register=0');

    await waitFor(() => expect(getAuthorizationUrl).toHaveBeenCalledWith({ register: '1' }));
  });

  it('clears a previous session error before starting a fresh sign-up', () => {
    useSessionStore.setState({ error: { httpCode: 403 } as ApiError });

    renderSignup('');

    expect(useSessionStore.getState().error).toBeNull();
  });
});
