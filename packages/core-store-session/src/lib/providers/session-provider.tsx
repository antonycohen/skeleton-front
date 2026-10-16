import { ReactNode, useEffect } from 'react';
import { useSetupSessionUser } from './session-items/use-setup-session-user';
import { useSessionStore } from '../store/session-store';

export function SessionProvider({ children }: { children: ReactNode }) {
  const setIsLoading = useSessionStore((state) => state.setIsLoading);

  const { isFetched: userIsLoading } = useSetupSessionUser();

  useEffect(() => {
    setIsLoading(userIsLoading);
  }, [userIsLoading, setIsLoading]);

  return children;
}
