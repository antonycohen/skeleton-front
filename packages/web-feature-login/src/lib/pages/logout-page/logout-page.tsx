import {useEffect, useRef} from 'react';

export function LogoutPage() {
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    console.log()
    document.location.href = `${import.meta.env['VITE_API_URL']}/logout?target_url=${encodeURIComponent(window.location.origin + '/logout/callback')}`;
  }, [])

  return null;
}

export default LogoutPage;
