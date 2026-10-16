import { getTokensFromCodeRedirect } from '@skeleton/core-api';
import { useOAuthStore } from '@skeleton/core-store-oauth';
import { useConnectedUser } from '@skeleton/core-store-session';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@skeleton/core-translations';
import {
  asSignInRefusal,
  isSsoRefusal,
  SIGN_IN_REFUSALS,
  SignInRefusal,
  signInRefusalFromError,
} from '../shared';

/**
 * Set while a failed code exchange is being retried with a fresh authorization, so a transient
 * failure (expired or already-used code after a reload, a verifier overwritten by a login started
 * in another tab) self-heals once, and a persistent one ends on the error state instead of looping
 * between /login and /login/callback forever.
 */
export const OAUTH_CALLBACK_RETRY_FLAG = 'oauth-callback-retried';

export const OauthCallbackPage = () => {
  const hasFetchToken = useRef(false);
  const hasHandledProviderError = useRef(false);
  const exchangeInFlight = useRef(false);
  const [exchangeFailed, setExchangeFailed] = useState(false);
  const [exchangeRefusal, setExchangeRefusal] = useState<SignInRefusal | null>(null);

  const setAuth = useOAuthStore((state) => state.setAuth);
  const accessToken = useOAuthStore((state) => state.accessToken);
  // The session this tab is losing still names the address, which is what lets the portal route it
  // to its identity provider without anything to type.
  const connectedUserEmail = useConnectedUser()?.email ?? null;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const url = window.location.href;
  const searchParams = new URLSearchParams(window.location.search);
  const hasCodeParameter = searchParams.has('code');
  // The authorization server redirected back with an error (access_denied, invalid_request...) instead of a code
  const providerError = searchParams.get('error');
  const providerErrorDescription = searchParams.get('error_description');
  // The authorization itself was refused for something the portal can settle on the next pass (no
  // second factor, single sign-on required, a session that ended). Whether the single retry through
  // the login was already spent is read once, at mount: the effect below spends it, and the error
  // state is derived from the two rather than set from inside that effect.
  const providerRefusal = providerError ? asSignInRefusal(providerErrorDescription) : null;
  const [retryAlreadySpent] = useState(() => !!sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG));

  useEffect(() => {
    if (hasFetchToken.current) return;
    if (!hasCodeParameter) return;
    hasFetchToken.current = true;
    exchangeInFlight.current = true;
    // Strip the auth code from the URL bar so it isn't captured by analytics
    // or kept in browser history once it has been exchanged for tokens.
    window.history.replaceState({}, '', window.location.pathname);
    getTokensFromCodeRedirect(url)
      .then((response) => {
        exchangeInFlight.current = false;
        sessionStorage.removeItem(OAUTH_CALLBACK_RETRY_FLAG);
        setAuth({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          accessTokenExpirationDate: response.expiresAt,
        });
        navigate('/login/dispatcher', { replace: true });
      })
      .catch((error: unknown) => {
        exchangeInFlight.current = false;
        console.error('OAuth code exchange failed', error);
        if (useOAuthStore.getState().accessToken) {
          // Another tab completed the login meanwhile (the PKCE verifier is shared through
          // localStorage, so it clobbered ours): this tab is already signed in, no retry needed.
          navigate('/login/dispatcher', { replace: true });
          return;
        }
        const refusal = signInRefusalFromError(error);
        if (!sessionStorage.getItem(OAUTH_CALLBACK_RETRY_FLAG)) {
          sessionStorage.setItem(OAUTH_CALLBACK_RETRY_FLAG, '1');
          navigate(loginTarget(refusal, connectedUserEmail), { replace: true });
          return;
        }
        sessionStorage.removeItem(OAUTH_CALLBACK_RETRY_FLAG);
        setExchangeRefusal(refusal);
        setExchangeFailed(true);
      });
  }, [connectedUserEmail, hasCodeParameter, navigate, setAuth, url]);

  // Tokens can also arrive from another tab that completed the login (the store syncs across
  // tabs); while this tab's own exchange is in flight its outcome decides instead.
  useEffect(() => {
    if (!accessToken || exchangeInFlight.current || providerError) return;
    navigate('/login/dispatcher', { replace: true });
  }, [accessToken, navigate, providerError]);

  useEffect(() => {
    if (!providerError || hasHandledProviderError.current) return;
    hasHandledProviderError.current = true;
    console.error('OAuth authorization failed', providerError, providerErrorDescription);
    if (providerRefusal) {
      // Same single retry as a failed exchange: one more pass through the login lets the portal
      // show its forced set-up step, or route the address to its identity provider; a second
      // refusal ends on the error state instead of looping.
      if (!retryAlreadySpent) {
        sessionStorage.setItem(OAUTH_CALLBACK_RETRY_FLAG, '1');
        navigate(loginTarget(providerRefusal, connectedUserEmail), { replace: true });
        return;
      }
      sessionStorage.removeItem(OAUTH_CALLBACK_RETRY_FLAG);
      return;
    }
    // The server refused the authorization itself (e.g. `access_denied` when the account lacks
    // back-office access): a retry would only be refused again, so end on the denied page.
    const denied = new URLSearchParams({ error: providerError });
    if (providerErrorDescription) {
      denied.set('error_description', providerErrorDescription);
    }
    navigate(`/login/denied?${denied.toString()}`, { replace: true });
  }, [
    connectedUserEmail,
    providerError,
    providerErrorDescription,
    providerRefusal,
    retryAlreadySpent,
    navigate,
  ]);

  const refusal = exchangeRefusal ?? providerRefusal;

  if (exchangeFailed || (providerRefusal && retryAlreadySpent)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-bold">{t('login.callback.failedTitle')}</h1>
        <p className="text-muted-foreground">
          {refusal
            ? t(SIGN_IN_REFUSALS[refusal].i18nKey)
            : t('login.callback.linkExpired')}
        </p>
        <a className="underline" href="/login">
          {t('login.callback.tryAgain')}
        </a>
      </div>
    );
  }

  if (providerError) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">{t('login.callback.signingIn')}</h1>
    </div>
  );
};

/**
 * Where the single retry goes. `/login` forwards its query to the authorization request, so a
 * `login_hint` reaches the portal, which sends a known address straight to its identity provider —
 * nothing to type, and a live provider session makes it a plain redirect.
 */
const loginTarget = (refusal: SignInRefusal | null, email: string | null): string =>
  isSsoRefusal(refusal) && email
    ? `/login?login_hint=${encodeURIComponent(email)}`
    : '/login';
