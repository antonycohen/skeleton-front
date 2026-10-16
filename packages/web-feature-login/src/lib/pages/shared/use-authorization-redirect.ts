import { getAuthorizationUrl } from '@skeleton/core-api';
import { useSessionStore } from '@skeleton/core-store-session';
import { useEffect, useRef } from 'react';

/**
 * Sends the browser to the authorization server once, on mount, with the extra authorization
 * parameters `buildExtraParams` derives from the current query string (see
 * `authorizationExtraParams`). Shared by `/login` and `/signup`, which differ only in the
 * parameters they forward. `buildExtraParams` must be a stable function (module level), so the
 * effect keeps a single dependency set and the parameters are computed inside it, after the guard.
 */
export const useAuthorizationRedirect = (
  buildExtraParams: (search: string) => Record<string, string> | undefined,
) => {
  const hasRedirected = useRef(false);
  const setSessionError = useSessionStore((state) => state.setError);

  useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    // A failed session set-up ended on /login/denied; a fresh login or sign-up starts clean,
    // otherwise ProtectedPage would send the new session straight back there.
    setSessionError(null);

    getAuthorizationUrl(buildExtraParams(window.location.search)).then((url) => {
      document.location.href = url;
    });
  }, [buildExtraParams, setSessionError]);
};
