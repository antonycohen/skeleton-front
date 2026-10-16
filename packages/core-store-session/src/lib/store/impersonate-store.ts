import { ImpersonateActions, ImpersonateState } from '../types';
import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';

export const IMPERSONATE_STORAGE_KEY = 'impersonate-store';

const defaultInitialState: ImpersonateState = {
  impersonateId: null,
};

export const useImpersonateStore = create<ImpersonateState & ImpersonateActions>()(
  persist(
    (set) => ({
      ...defaultInitialState,
      setImpersonateId: (impersonateId: string | null) => set(() => ({ impersonateId })),
      resetImpersonate: () => set(defaultInitialState),
    }),
    {
      name: IMPERSONATE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage)
    },
  ),
);
