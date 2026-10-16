import { ApiError, AppConfiguration, User } from '@skeleton/core-api-models';

// Auth state and actions for managing user authentication
export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpirationDate: number | null;
};

export type AuthActions = {
  setAccessToken: (accessToken: string | null) => void;
  setAuth: (authResponse: AuthState) => void;
  reset: () => void;
};

// Impersonation state and actions for managing user impersonation
export type ImpersonateState = {
  impersonateId: string | null;
}

export type ImpersonateActions = {
  setImpersonateId: (impersonateId: string | null) => void;
  resetImpersonate: () => void;
}

export type SessionState = {
  connectedUser: User | null;
  isLoading: boolean;
  configuration: AppConfiguration | null;
  error: ApiError | null;
}

export type SessionActions = {
  setConnectedUser: (user: User | null) => void;
  setConfiguration: (configuration: AppConfiguration | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: ApiError | null) => void;
  resetSession: () => void;
}
