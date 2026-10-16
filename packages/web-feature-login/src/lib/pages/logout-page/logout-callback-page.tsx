import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOAuthStore } from '@skeleton/core-store-oauth';
import { useImpersonateStore, useSessionStore } from '@skeleton/core-store-session';

export function LogoutPage() {
  const navigate = useNavigate();
  const hasLoggedOut = useRef(false);
  const resetOAuth = useOAuthStore((state) => state.reset);
  const resetImpersonate = useImpersonateStore((state) => state.resetImpersonate);
  const resetSession = useSessionStore((state) => state.resetSession);

  useEffect(() => {
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;

    localStorage.removeItem('target-url');
    resetOAuth();
    resetImpersonate();
    resetSession();
    navigate('/login', { replace: true });
  }, [resetOAuth, resetImpersonate, navigate, resetSession]);

  return null;
}

export default LogoutPage;
