import { useEffect } from 'react';
import { useOAuthStore, useUserIdFromToken } from '@skeleton/core-store-oauth';
import { User } from '@skeleton/core-api-models';
import { useSessionStore } from '../../store/session-store';
import { FieldQuery, useGetUserById } from '@skeleton/core-api';

const userSessionFields: FieldQuery<User> = {
  id: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
};

export function useSetupSessionUser() {
  const userId = useUserIdFromToken();
  const accessToken = useOAuthStore((state) => state.accessToken);
  const reset = useOAuthStore((state) => state.reset);

  const setConnectedUser = useSessionStore((state) => state.setConnectedUser);
  const setError = useSessionStore((state) => state.setError);

  const {
    data: userResponse,
    error: userError,
    isLoading,
    isFetched,
    ...userQuery
  } = useGetUserById(
    {
      id: userId as string,
      fields: userSessionFields,
    },
    { enabled: !!accessToken && !!userId },
  );

  useEffect(() => {
    if (userError) {
      // Record the failure for ProtectedPage / DispatcherPage (they end on /login/denied). The
      // token is dropped only when the API refused it (invalid, or not accepted for this app): a
      // transient failure (network, 5xx) must not rewrite the auth cookie and log the user out of
      // every tab of this app.
      setError(userError);
      if (userError.httpCode === 401 || userError.httpCode === 403) {
        reset();
      }
      return;
    }

    if (userResponse && !isLoading) {
      setConnectedUser(userResponse);
      // A tab that failed earlier and later received a valid token recovers without a reload
      setError(null);
    }

    if (!userResponse && !isLoading && isFetched) {
      console.log('useSetupSessionUser: No user response, resetting OAuth store');
      reset();
    }
  }, [userError, userResponse, setError, setConnectedUser, accessToken, reset, isLoading, userId, isFetched]);

  return { userResponse, userError, isFetched, ...userQuery };
}
