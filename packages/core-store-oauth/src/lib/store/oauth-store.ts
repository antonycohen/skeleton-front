import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';
import { createCookieStorage } from '../utils/cookie-storage';
import { OAuthActions, OAuthState } from '../../types';
import { registerStoreSynchronizer } from '../utils/store-synchronizer';
import { isTokenForThisApp } from '../utils/access-token';

export const DEFAULT_AUTH_STORAGE_KEY = 'skeleton-auth-store';

/**
 * Cookie the store persists into. It sits on the registrable parent domain (see
 * `createCookieStorage`), where every app of the platform can read it, so each app persists under
 * its own name: `VITE_AUTH_COOKIE_NAME` (the back office sets `skeleton-auth-store-bo`), defaulting
 * to the web app's name. Two apps open in the same browser thus never overwrite each other's token on
 * a login, a refresh or a logout.
 */
export const AUTH_STORAGE_KEY: string =
  import.meta.env['VITE_AUTH_COOKIE_NAME'] || DEFAULT_AUTH_STORAGE_KEY;
/** localStorage is per origin, so this key never crosses apps; it only follows the cookie name. */
export const AUTH_STORAGE_KEY_SYNC = `${AUTH_STORAGE_KEY}-sync`;


const cookieStorage = createCookieStorage<OAuthState & OAuthActions>(AUTH_STORAGE_KEY_SYNC);
const defaultInitialState: OAuthState = {
  accessToken: null,
  refreshToken: null,
  accessTokenExpirationDate: null,
};

export const useOAuthStore = create<OAuthState & OAuthActions>()(
  persist(
    (set) => ({
      ...defaultInitialState,
      // No audience check here: setAuth only ever receives tokens this app's own client just
      // obtained. The gate sits where a foreign token can come in — rehydration (`merge` below)
      // and the cross-tab synchronizer.
      setAuth: (authResponse) => set(authResponse),
      reset: () => set(defaultInitialState),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: cookieStorage,
      // Each app persists under its own cookie name, but the names all live on the same parent
      // domain, so a token minted for another app's OAuth client can still land here (an older
      // deploy, a dev subdomain, a hand-copied cookie). It is dropped at rehydration instead of
      // adopted — and, since the hydration `set` bypasses the persist writer, the cookie is left
      // untouched.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<OAuthState> | undefined;
        if (persisted?.accessToken && !isTokenForThisApp(persisted.accessToken)) {
          return currentState;
        }
        return { ...currentState, ...persisted };
      },
    },
  ),
);

registerStoreSynchronizer();
