import { useSessionStore } from '../store/session-store';

export const useSessionIsLoading = () => {
  return useSessionStore((state) => state.isLoading);
}
