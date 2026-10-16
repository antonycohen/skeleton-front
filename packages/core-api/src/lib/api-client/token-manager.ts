import { useOAuthStore } from '@skeleton/core-store-oauth';
import { getNewToken } from '../oauth-client/oauth-client';

export class TokenManager {
  private refreshPromise: Promise<void> | null = null;
  private refreshLock: string | null = null;
  private readonly LOCK_KEY = 'api-refresh-lock';
  private readonly LOCK_TIMEOUT = 10000;

  constructor() {
    this.setupCrossTabLock();
  }

  private setupCrossTabLock() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
      if (event.key === this.LOCK_KEY && event.newValue === null) {
        this.refreshLock = null;
      }
    });
  }

  private acquireLock(): boolean {
    if (typeof window === 'undefined') return true;

    const now = Date.now();
    const currentLock = localStorage.getItem(this.LOCK_KEY);

    if (currentLock) {
      const lockTime = parseInt(currentLock, 10);
      if (now - lockTime < this.LOCK_TIMEOUT) {
        return false;
      }
    }

    const lockId = `${now}-${Math.random()}`;
    localStorage.setItem(this.LOCK_KEY, now.toString());
    this.refreshLock = lockId;

    const storedLock = localStorage.getItem(this.LOCK_KEY);
    return storedLock === now.toString();
  }

  private releaseLock() {
    if (typeof window === 'undefined') return;
    if (this.refreshLock) {
      localStorage.removeItem(this.LOCK_KEY);
      this.refreshLock = null;
    }
  }

  isTokenValid(): boolean {
    const { accessTokenExpirationDate } = useOAuthStore.getState();
    if (!accessTokenExpirationDate) return true;
    return Date.now() < accessTokenExpirationDate - 60000;
  }

  async refreshToken(): Promise<void> {
    const { refreshToken } = useOAuthStore.getState();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (!this.acquireLock()) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const { accessToken } = useOAuthStore.getState();
      if (accessToken && this.isTokenValid()) {
        return;
      }
      return this.refreshToken();
    }

    try {
      const response = await getNewToken(refreshToken);
      useOAuthStore.getState().setAuth({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpirationDate: response.expiresAt,
      });
    } finally {
      this.releaseLock();
    }
  }

  async getValidToken(): Promise<string> {
    const { accessToken } = useOAuthStore.getState();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    if (this.isTokenValid()) {
      return accessToken;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshToken().catch(() => {
        useOAuthStore.getState().reset();
      }).finally(() => {
        this.refreshPromise = null;
      });
    }

    await this.refreshPromise;

    const newToken = useOAuthStore.getState().accessToken;
    if (!newToken) {
      throw new Error('Failed to obtain valid token');
    }

    return newToken;
  }

  clearToken() {
    console.log('Clearing token token after repeated 401 responses');
    useOAuthStore.getState().reset();
  }
}
