import { useSessionStore } from '../store/session-store';

export const useConnectedUser = () => {
  return useSessionStore((state) => state.connectedUser);
}
