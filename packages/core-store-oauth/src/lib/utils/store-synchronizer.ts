import {
  AUTH_STORAGE_KEY,
  AUTH_STORAGE_KEY_SYNC,
  useOAuthStore,
} from '../store/oauth-store';
import { OAuthState } from '../../types';
import { isTokenForThisApp } from './access-token';

const getCookieValue = (name: string): string | null => {
  const cookies = document.cookie.split("; ").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = decodeURIComponent(value);

      return acc;
    },
    {} as Record<string, string>,
  );

  return cookies[name] || null;
};

export const registerStoreSynchronizer = () => {
  if (typeof window !== "undefined") {
    const syncStateFromStorage = async () => {
      try {
        const currentStoreValue = useOAuthStore.getState();
        const cookieValue = getCookieValue(AUTH_STORAGE_KEY);
        if (!cookieValue) {
          return;
        }
        const cookieState: Partial<OAuthState> | undefined = JSON.parse(cookieValue).state;
        if (!cookieState) {
          return;
        }
        if (cookieState.accessToken && !isTokenForThisApp(cookieState.accessToken)) {
          // A token minted for another app of the platform under this app's cookie name (see the store's
          // `merge`): never adopt it, and never `setState` here — the persist writer would push
          // our state back into the cookie.
          return;
        }
        if (JSON.stringify(cookieState) !== JSON.stringify(currentStoreValue)) {
          useOAuthStore.setState(cookieState);
        }
      } catch (e) {
        console.warn("Failed to sync auth-store from storage", e);
      }
    };

    window.addEventListener("storage", (event) => {
      if (event.key === AUTH_STORAGE_KEY_SYNC && event.newValue) {
        void syncStateFromStorage();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void syncStateFromStorage();
      }
    });
  }
};
