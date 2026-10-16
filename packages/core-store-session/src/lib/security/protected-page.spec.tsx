import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ApiError } from '@skeleton/core-api-models';

const oauthState: { accessToken: string | null } = { accessToken: null };

vi.mock('@skeleton/core-store-oauth', () => ({
  useOAuthStore: (selector: (state: typeof oauthState) => unknown) => selector(oauthState),
}));

const { ProtectedPage } = await import('./protected-page');
const { useSessionStore } = await import('../store/session-store');

const DeniedProbe = () => {
  const { search } = useLocation();
  return <div>denied page {search}</div>;
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/login/denied" element={<DeniedProbe />} />
        <Route element={<ProtectedPage />}>
          <Route path="*" element={<div>protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedPage', () => {
  beforeEach(() => {
    oauthState.accessToken = null;
    useSessionStore.setState({ error: null });
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing without a token, remembers the target and goes to the login', async () => {
    renderAt('/w/42/settings?tab=pages');

    expect(screen.queryByText('protected content')).toBeNull();
    await waitFor(() => expect(screen.getByText('login page')).toBeTruthy());
    expect(localStorage.getItem('target-url')).toBe('/w/42/settings?tab=pages');
  });

  it('renders the protected outlet with a token', () => {
    oauthState.accessToken = 'token';

    renderAt('/w/42/settings');

    expect(screen.getByText('protected content')).toBeTruthy();
    expect(localStorage.getItem('target-url')).toBeNull();
  });

  it('ends on the denied page when the session could not be set up, even with a token', async () => {
    oauthState.accessToken = 'token';
    useSessionStore.setState({ error: { httpCode: 403 } as ApiError });

    renderAt('/w/42/settings');

    expect(screen.queryByText('protected content')).toBeNull();
    await waitFor(() =>
      expect(screen.getByText('denied page ?error=session_unavailable')).toBeTruthy(),
    );
  });
});
