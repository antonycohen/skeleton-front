import { useOAuthStore } from '../store/oauth-store';
import { decodeAccessToken } from '../utils/access-token';

export const useUserIdFromToken = (): string | null => {
  const token = useOAuthStore((state) => state?.accessToken);
  const sub = decodeAccessToken(token)?.sub;

  return typeof sub === 'string' ? sub : null;
};
