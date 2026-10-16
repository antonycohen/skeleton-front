import { createJSONStorage } from "zustand/middleware";

const getDomainNameWithoutSubdomain = (): string => {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length > 2) {
    return parts.slice(1).join("."); // Remove subdomain
  }

  return hostname; // No subdomain, return as is
};

export const createCookieStorage = <T>(localStorageSyncKey?: string) =>
  createJSONStorage<T>(() => {
    const cookies = document.cookie.split("; ").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = decodeURIComponent(value);

        return acc;
      },
      {} as Record<string, string>,
    );

  return {
    getItem: (name: string) => cookies[name] || null,
    setItem: (name: string, value: string) => {
      const domain = getDomainNameWithoutSubdomain();
      const isCurrentSchmeHttps = window.location.protocol === "https:";
      document.cookie = `${name}=${encodeURIComponent(
        value,
      )}; path=/; domain=${domain}; SameSite=Lax; ${isCurrentSchmeHttps ? 'Secure' : ''}`
      if (localStorageSyncKey) {
        localStorage.setItem(localStorageSyncKey, Date.now().toString());
      }
    },
    removeItem: (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    },
  };
});
