import { create } from 'zustand/react';

type WorkspaceState = {
  workspaceId: string | null;
};

type WorkspaceActions = {
  setWorkspaceId: (workspaceId: string | null) => void;
};

const defaultInitialState: WorkspaceState = {
  workspaceId: null,
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  (set) => ({
    ...defaultInitialState,
    setWorkspaceId: (workspaceId) => set({ workspaceId }),
  }),
);
