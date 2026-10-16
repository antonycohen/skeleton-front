import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
// Static on purpose: a dynamic `import()` of a workspace package marks it lazy-loaded for Nx,
// which then forbids the static imports the sources make. The real store is used so a token
// written by "another tab" (setState) reaches the page the way the cross-tab sync does.
import { useOAuthStore } from '@skeleton/core-store-oauth';
import { useSessionStore } from '@skeleton/core-store-session';
import { User } from '@skeleton/core-api-models';

const getTokensFromCodeRedirect = vi.fn();

vi.mock('@skeleton/core-api', () => ({
  getTokensFromCodeRedirect: (...args: unknown[]) => getTokensFromCodeRedirect(...args),
}));

const { OauthCallbackPage, OAUTH_CALLBACK_RETRY_FLAG } = await import('./oauth-callback-page');

const CALLBACK_WITH_CODE = '/login/callback?code=abc&state=state';

const DeniedProbe = () => {
  const { search } = useLocation();
  return <div>denied page {search}</div>;
};

/** The login's own query is asserted on: it is what carries a `login_hint` to the portal. */
const LoginProbe = () => {
  const { search } = useLocation();
  return (
    <>
      <div>login page</div>
      <div>login query {search}</div>
    </>
  );
};

/** The page reads window.location itself, so the jsdom URL has to match the router entry. */
const renderCallback = (path: string) => {
  window.history.replaceState({}, '', path);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginProbe />} />
        <Route path="/login/callback" element={<OauthCallbackPage />} />
        <Route path="/login/dispatcher" element={<div>dispatcher page</div>} />
        <Route path="/login/denied" element={<DeniedProbe />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('OauthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    useOAuthStore.getState().reset();
    useSessionStore.getState().resetSession();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('exchanges the code, stores the tokens, strips the code from the URL and dispatches', async () => {
    getTokensFromCodeRedirect.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresAt: 1234,
    });
    sessionStorage.setItem(OAUTH_CALLBACK_RETRY_FLAG, '1');

    renderCallback(CALLBACK_WITH_CODE);

    await waitFor(() => expect(useOAuthStore.getState().accessToken).toBe('access'));
    expect(useOAuthStore.getState().refreshToken).toBe('refresh');
    expect(useOAuthStore.getState().accessTokenExpirationDate).toBe(1234);
    expect(getTokensFromCodeRedirect).toHaveBeenCalledWith(expect.stringContaining('code=abc'));
    expect(window.location.search).toBe('');
    expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBeNull();
    await waitFor(() => expect(screen.getByText('dispatcher page')).toBeTruthy());
  });

  it('retries once with a fresh authorization when the exchange fails', async () => {
    getTokensFromCodeRedirect.mockRejectedValue(new Error('invalid_grant'));

    renderCallback(CALLBACK_WITH_CODE);

    await waitFor(() => expect(screen.getByText('login page')).toBeTruthy());
    expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBe('1');
    expect(useOAuthStore.getState().accessToken).toBeNull();
  });

  it('shows the error state instead of looping when the retried exchange fails too', async () => {
    getTokensFromCodeRedirect.mockRejectedValue(new Error('invalid_grant'));
    sessionStorage.setItem(OAUTH_CALLBACK_RETRY_FLAG, '1');

    renderCallback(CALLBACK_WITH_CODE);

    await waitFor(() => expect(screen.getByText('Sign-in could not be completed')).toBeTruthy());
    expect(screen.getByText('Try again').getAttribute('href')).toBe('/login');
    expect(screen.queryByText('login page')).toBeNull();
    expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBeNull();
  });

  it('dispatches instead of retrying when another tab signed in while the exchange was failing', async () => {
    getTokensFromCodeRedirect.mockImplementation(async () => {
      // The other tab's login landed in the shared store before our (clobbered) exchange came back
      act(() => useOAuthStore.setState({ accessToken: 'from-other-tab' }));
      throw new Error('invalid_grant');
    });

    renderCallback(CALLBACK_WITH_CODE);

    await waitFor(() => expect(screen.getByText('dispatcher page')).toBeTruthy());
    expect(screen.queryByText('login page')).toBeNull();
    expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBeNull();
  });

  it('dispatches when a token arrives from another tab while waiting without a code', async () => {
    renderCallback('/login/callback');
    expect(screen.getByText('Signing you in…')).toBeTruthy();

    act(() => useOAuthStore.setState({ accessToken: 'from-other-tab' }));

    await waitFor(() => expect(screen.getByText('dispatcher page')).toBeTruthy());
    expect(getTokensFromCodeRedirect).not.toHaveBeenCalled();
  });

  it('goes to the denied page when the authorization server answered with an error instead of a code', async () => {
    renderCallback(
      '/login/callback?error=access_denied&error_description=Back-office%20access%20required&state=state'
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          'denied page ?error=access_denied&error_description=Back-office+access+required'
        )
      ).toBeTruthy()
    );
    expect(getTokensFromCodeRedirect).not.toHaveBeenCalled();
    expect(screen.queryByText('Signing you in…')).toBeNull();
  });

  // B-260: `mfa_enrolment_required` is not a refused account. The portal makes the user set
  // two-factor authentication up on the next pass, so it goes back through the login (once) and
  // never ends on the denied page, which is for accounts without access to the app.
  describe('when two-factor authentication must be set up first', () => {
    const MFA_REFUSED_CALLBACK =
      '/login/callback?error=access_denied&error_description=mfa_enrolment_required&state=state';
    const mfaRefusal = () =>
      Object.assign(new Error('OAuth2 error access_denied. mfa_enrolment_required'), {
        oauth2Code: 'access_denied',
        parsedBody: { error: 'access_denied', error_description: 'mfa_enrolment_required' },
      });

    it('goes back through the login instead of the denied page', async () => {
      renderCallback(MFA_REFUSED_CALLBACK);

      await waitFor(() => expect(screen.getByText('login page')).toBeTruthy());
      expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBe('1');
      expect(screen.queryByText(/denied page/)).toBeNull();
    });

    it('ends on the error state instead of looping when it is refused again', async () => {
      sessionStorage.setItem(OAUTH_CALLBACK_RETRY_FLAG, '1');

      renderCallback(MFA_REFUSED_CALLBACK);

      await waitFor(() =>
        expect(
          screen.getByText(
            'Two-factor authentication must be set up on your account before you can sign in.'
          )
        ).toBeTruthy()
      );
      expect(screen.queryByText('login page')).toBeNull();
      expect(screen.queryByText(/denied page/)).toBeNull();
      expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBeNull();
    });

    it('retries a refused code exchange once, then says why', async () => {
      getTokensFromCodeRedirect.mockRejectedValue(mfaRefusal());

      const first = renderCallback(CALLBACK_WITH_CODE);
      await waitFor(() => expect(screen.getByText('login page')).toBeTruthy());
      expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBe('1');
      first.unmount();

      renderCallback(CALLBACK_WITH_CODE);
      await waitFor(() =>
        expect(
          screen.getByText(
            'Two-factor authentication must be set up on your account before you can sign in.'
          )
        ).toBeTruthy()
      );
      expect(screen.queryByText(/denied page/)).toBeNull();
      expect(useOAuthStore.getState().accessToken).toBeNull();
    });
  });

  // B-264 refuses a token for an address an enforced connection owns (`sso_required`), for a single
  // sign-on session past its bound (`sso_session_expired`) and for one opened before access was
  // ended (`session_revoked`). None is a refused account: each is settled on the next pass through
  // the login, like `mfa_enrolment_required`.
  describe('when single sign-on refuses the token', () => {
    const refusedCallback = (description: string) =>
      `/login/callback?error=access_denied&error_description=${description}&state=state`;

    const signedInAs = (email: string) =>
      useSessionStore.setState({ connectedUser: { id: 'u1', email } as User });

    it('goes back through the login with the address, so the portal routes it to the provider', async () => {
      signedInAs('ada@acme.com');

      renderCallback(refusedCallback('sso_required'));

      await waitFor(() => expect(screen.getByText('login page')).toBeTruthy());
      expect(screen.getByText('login query ?login_hint=ada%40acme.com')).toBeTruthy();
      expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBe('1');
      expect(screen.queryByText(/denied page/)).toBeNull();
    });

    it('goes back through the login without a hint when no address is known', async () => {
      renderCallback(refusedCallback('sso_session_expired'));

      await waitFor(() => expect(screen.getByText('login page')).toBeTruthy());
      expect(screen.getByText('login query')).toBeTruthy();
      expect(screen.queryByText(/denied page/)).toBeNull();
    });

    it('says why instead of looping when the retry was already spent', async () => {
      sessionStorage.setItem(OAUTH_CALLBACK_RETRY_FLAG, '1');

      renderCallback(refusedCallback('sso_required'));

      await waitFor(() =>
        expect(
          screen.getByText(
            'This workspace signs its members in through its own identity provider. Sign in there to continue.'
          )
        ).toBeTruthy()
      );
      expect(screen.queryByText('login page')).toBeNull();
      expect(sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)).toBeNull();
    });

    it('treats a revoked session the same way, and never as a refused account', async () => {
      signedInAs('ada@acme.com');
      sessionStorage.setItem(OAUTH_CALLBACK_RETRY_FLAG, '1');

      renderCallback(refusedCallback('session_revoked'));

      await waitFor(() =>
        expect(screen.getByText('Your session was ended. Sign in again to continue.')).toBeTruthy()
      );
      expect(screen.queryByText(/denied page/)).toBeNull();
    });

    it('reads the refusal off a refused code exchange too', async () => {
      signedInAs('ada@acme.com');
      getTokensFromCodeRedirect.mockRejectedValue(
        Object.assign(new Error('OAuth2 error access_denied. sso_session_expired'), {
          parsedBody: { error: 'access_denied', error_description: 'sso_session_expired' },
        })
      );

      const first = renderCallback(CALLBACK_WITH_CODE);
      await waitFor(() =>
        expect(screen.getByText('login query ?login_hint=ada%40acme.com')).toBeTruthy()
      );
      first.unmount();

      renderCallback(CALLBACK_WITH_CODE);
      await waitFor(() =>
        expect(
          screen.getByText(
            'Your single sign-on session has expired. Sign in through your identity provider again.'
          )
        ).toBeTruthy()
      );
    });
  });
});
