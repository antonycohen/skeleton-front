import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_STORAGE_KEY, AUTH_STORAGE_KEY_SYNC, useOAuthStore } from '../store/oauth-store';

const THIS_APP = 'oidc-client-backoffice';
const OTHER_APP = 'oidc-client-public';

const jwt = (payload: Record<string, unknown>): string => {
  const encode = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode('{"alg":"RS256"}')}.${encode(JSON.stringify(payload))}.signature`;
};

const writeCookie = (accessToken: string) => {
  document.cookie = `${AUTH_STORAGE_KEY}=${encodeURIComponent(
    JSON.stringify({
      state: { accessToken, refreshToken: 'refresh', accessTokenExpirationDate: 1234 },
      version: 0,
    }),
  )}`;
};

/** Another tab wrote the cookie and bumped the sync key: the synchronizer re-reads the cookie. */
const notifyOtherTabWrite = async () => {
  window.dispatchEvent(
    new StorageEvent('storage', { key: AUTH_STORAGE_KEY_SYNC, newValue: Date.now().toString() }),
  );
  await Promise.resolve();
};

describe('registerStoreSynchronizer', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_OAUTH_CLIENT_ID', THIS_APP);
  });

  afterEach(() => {
    useOAuthStore.getState().reset();
    document.cookie = `${AUTH_STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    vi.unstubAllEnvs();
  });

  it('adopts a token issued to this app written by another tab', async () => {
    const token = jwt({ sub: 'user-1', aud: THIS_APP });
    writeCookie(token);

    await notifyOtherTabWrite();

    expect(useOAuthStore.getState().accessToken).toBe(token);
  });

  it('ignores a token issued to another app and does not touch the store', async () => {
    const setState = vi.spyOn(useOAuthStore, 'setState');
    writeCookie(jwt({ sub: 'user-1', aud: OTHER_APP }));

    await notifyOtherTabWrite();

    expect(useOAuthStore.getState().accessToken).toBeNull();
    expect(setState).not.toHaveBeenCalled();
  });
});
