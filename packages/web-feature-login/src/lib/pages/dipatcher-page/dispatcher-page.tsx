import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useConnectedUser, useSessionStore } from '@skeleton/core-store-session';
import { useOAuthStore } from '@skeleton/core-store-oauth';
import { useTranslation } from '@skeleton/core-translations';

export const DispatcherPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const connectedUser = useConnectedUser();
  const accessToken = useOAuthStore((state) => state.accessToken);
  const sessionError = useSessionStore((state) => state.error);

  console.log('dispatcherPage', connectedUser);
  const targetUrl = localStorage.getItem("target-url") ?? "";

  useEffect(() => {
    if (sessionError) {
      // The token was issued but the user could not be loaded for this app: without this the
      // dropped token would send us back through the SSO forever.
      navigate('/login/denied?error=session_unavailable', { replace: true });
      return;
    }

    if (!connectedUser && !accessToken) {
      console.log('DispatcherPage navigate to login');
      navigate("/login");
      return;
    }

    if (!connectedUser && accessToken) {
      return;
    }

    if (targetUrl) {
      console.log('DispatcherPage navigate to targetUrl', targetUrl);

      localStorage.removeItem("target-url");
      navigate(targetUrl);
      return;
    }

    navigate('/', { replace: true });
  }, [accessToken, connectedUser, navigate, sessionError, targetUrl])


  return (
    <div>
      <h1>{t('login.dispatcher.redirecting')}</h1>
    </div>
  );
};
