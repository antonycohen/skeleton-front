import { useOAuthStore } from '@skeleton/core-store-oauth';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/session-store';

/**
 * Layout route in front of everything that needs a signed-in user. Nothing below it renders until
 * the store holds a token for this app: the redirect runs in an effect, so rendering the outlet in
 * the meantime would mount the protected tree — and fire its API calls — for an anonymous visitor.
 */
export const ProtectedPage = () => {
  const accessToken = useOAuthStore((state) => state.accessToken);
  const sessionError = useSessionStore((state) => state.error);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (sessionError) {
      // The token was accepted but the user behind it could not be loaded for this app (see
      // useSetupSessionUser): end on the denied page instead of looping through the login.
      navigate('/login/denied?error=session_unavailable', { replace: true });
      return;
    }
    if (!accessToken) {
      console.error('ProtectedPage: Access Token not found, redirecting to login page');
      localStorage.setItem(
        'target-url',
        `${location.pathname}${location.search}`,
      );
      navigate('/login');
    }
  }, [accessToken, sessionError, navigate, location.pathname, location.search]);

  if (!accessToken || sessionError) {
    return null;
  }

  return <Outlet />;
};
