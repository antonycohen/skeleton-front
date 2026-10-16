import { create } from 'zustand/react';
import { SessionActions, SessionState } from '../types';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SESSION_STORAGE_KEY = 'session-store';


const defaultInitialState: SessionState = {
  connectedUser: null,
  isLoading: true,
  configuration: null,
  error: null,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...defaultInitialState,
      setConnectedUser: (connectedUser) => set(() => ({ connectedUser })),
      setConfiguration: (configuration) => set(() => ({ configuration })),
      setIsLoading: (isLoading) => set(() => ({ isLoading })),
      setError: (error) => set(() => ({ error })),
      resetSession: () => set(defaultInitialState),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // `error` is transient: persisting it would park the user on /login/denied after a reload
      // for a failure that is long gone.
      partialize: ({ connectedUser, isLoading, configuration }) => ({
        connectedUser,
        isLoading,
        configuration,
      }),
    },
  ),
);
