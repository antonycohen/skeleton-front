import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const THIS_APP = 'oidc-client-backoffice';
const OTHER_APP = 'oidc-client-public';

const jwt = (payload: Record<string, unknown>): string => {
  const encode = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode('{"alg":"RS256"}')}.${encode(JSON.stringify(payload))}.signature`;
};

const DEFAULT_COOKIE = 'skeleton-auth-store';
const BO_COOKIE = 'skeleton-auth-store-bo';

const persistedCookie = (accessToken: string, name = DEFAULT_COOKIE) =>
  `${name}=${encodeURIComponent(
    JSON.stringify({
      state: { accessToken, refreshToken: 'refresh', accessTokenExpirationDate: 1234 },
      version: 0,
    }),
  )}`;

const clearCookie = () => {
  for (const name of [DEFAULT_COOKIE, BO_COOKIE]) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }
};

const cookieNames = () =>
  document.cookie
    .split('; ')
    .filter(Boolean)
    .map((cookie) => cookie.split('=')[0]);

/** The cookie storage snapshots document.cookie at module load, so every case gets a fresh module. */
const loadStore = async () => {
  vi.resetModules();
  return (await import('./oauth-store')).useOAuthStore;
};

describe('useOAuthStore', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_OAUTH_CLIENT_ID', THIS_APP);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    clearCookie();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('rehydration from the shared cookie', () => {
    it('adopts a token issued to this app', async () => {
      const token = jwt({ sub: 'user-1', aud: THIS_APP });
      document.cookie = persistedCookie(token);

      const useOAuthStore = await loadStore();

      expect(useOAuthStore.getState().accessToken).toBe(token);
      expect(useOAuthStore.getState().refreshToken).toBe('refresh');
      expect(useOAuthStore.getState().accessTokenExpirationDate).toBe(1234);
    });

    it('drops a token issued to another app and leaves its cookie untouched', async () => {
      const cookie = persistedCookie(jwt({ sub: 'user-1', aud: OTHER_APP }));
      document.cookie = cookie;

      const useOAuthStore = await loadStore();

      expect(useOAuthStore.getState().accessToken).toBeNull();
      expect(useOAuthStore.getState().refreshToken).toBeNull();
      expect(useOAuthStore.getState().accessTokenExpirationDate).toBeNull();
      expect(document.cookie).toBe(cookie);
    });

    it('starts empty without a cookie', async () => {
      const useOAuthStore = await loadStore();

      expect(useOAuthStore.getState().accessToken).toBeNull();
    });
  });

  describe('setAuth', () => {
    it('stores a token issued to this app', async () => {
      const useOAuthStore = await loadStore();
      const token = jwt({ sub: 'user-1', aud: THIS_APP });

      useOAuthStore.getState().setAuth({
        accessToken: token,
        refreshToken: 'refresh',
        accessTokenExpirationDate: 1234,
      });

      expect(useOAuthStore.getState().accessToken).toBe(token);
    });

    it('stores whatever the code exchange returned, the audience gate being rehydration only', async () => {
      const useOAuthStore = await loadStore();
      const token = jwt({ sub: 'user-1', aud: OTHER_APP });

      useOAuthStore.getState().setAuth({
        accessToken: token,
        refreshToken: 'refresh',
        accessTokenExpirationDate: 1234,
      });

      expect(useOAuthStore.getState().accessToken).toBe(token);
    });
  });

  describe('per-app cookie name', () => {
    const auth = (token: string) => ({
      accessToken: token,
      refreshToken: 'refresh',
      accessTokenExpirationDate: 1234,
    });

    it('persists under skeleton-auth-store by default', async () => {
      const useOAuthStore = await loadStore();

      useOAuthStore.getState().setAuth(auth(jwt({ sub: 'user-1', aud: THIS_APP })));

      expect(cookieNames()).toEqual([DEFAULT_COOKIE]);
    });

    it('persists under VITE_AUTH_COOKIE_NAME and leaves the default cookie alone', async () => {
      vi.stubEnv('VITE_AUTH_COOKIE_NAME', BO_COOKIE);
      const token = jwt({ sub: 'user-1', aud: THIS_APP });
      const useOAuthStore = await loadStore();

      useOAuthStore.getState().setAuth(auth(token));

      expect(cookieNames()).toEqual([BO_COOKIE]);
      // A fresh load of the same app sees it; the web app (default name) never does
      expect((await loadStore()).getState().accessToken).toBe(token);
      vi.stubEnv('VITE_AUTH_COOKIE_NAME', '');
      expect((await loadStore()).getState().accessToken).toBeNull();
    });

    it('rehydrates from its own cookie, not from the default one', async () => {
      vi.stubEnv('VITE_AUTH_COOKIE_NAME', BO_COOKIE);
      const own = jwt({ sub: 'user-1', aud: THIS_APP });
      document.cookie = persistedCookie(jwt({ sub: 'user-2', aud: THIS_APP }));
      document.cookie = persistedCookie(own, BO_COOKIE);

      const useOAuthStore = await loadStore();

      expect(useOAuthStore.getState().accessToken).toBe(own);
    });

    it('starts empty when only the default cookie exists, even with a token for this app', async () => {
      // The state of the deploy that introduces the per-app name: the back office re-logs once
      vi.stubEnv('VITE_AUTH_COOKIE_NAME', BO_COOKIE);
      const cookie = persistedCookie(jwt({ sub: 'user-1', aud: THIS_APP }));
      document.cookie = cookie;

      const useOAuthStore = await loadStore();

      expect(useOAuthStore.getState().accessToken).toBeNull();
      expect(document.cookie).toBe(cookie);
    });
  });
});
