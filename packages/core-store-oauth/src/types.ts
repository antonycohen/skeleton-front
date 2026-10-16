// Auth state and actions for managing user authentication
export type OAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpirationDate: number | null;
};

export type OAuthActions = {
  setAuth: (authResponse: OAuthState) => void;
  reset: () => void;
};
