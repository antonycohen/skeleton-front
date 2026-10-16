import {create} from 'zustand/react';
import {persist} from 'zustand/middleware';
import type {JobAlertBarOptions} from './job-alert-bar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JobStatus = 'running' | 'completed' | 'failed';

export interface JobDefinition {
  /** Unique job identifier */
  id: string;

  tag?: string;
  /** Display name in the floating widget */
  name: string;
  /** URL to navigate to while job is still running */
  pendingUrl: string;
  /** URL to navigate to once job completes */
  completedUrl: string;
  /** Current status */
  status: JobStatus;
  /** Timestamp when the job was registered */
  createdAt: number;
  /** Top-bar alert. Not persisted (callbacks/ReactNodes are non-serializable). */
  alert?: JobAlertBarOptions;
}

interface JobStoreState {
  jobs: JobDefinition[];
}

interface JobStoreActions {
  registerJob: (job: Omit<JobDefinition, 'status' | 'createdAt'>) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  setJobAlert: (id: string, alert: JobAlertBarOptions | undefined) => void;
  removeJob: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const JOB_STORE_KEY = 'skeleton-job-store';

export const useJobStore = create<JobStoreState & JobStoreActions>()(
  persist(
    (set) => ({
      jobs: [],

      registerJob: (job) =>
        set((state) => {
          const existing = state.jobs.find((j) => j.id === job.id);
          if (existing) {
            // Merge: callers may re-register on mount with a fresh alert / callbacks.
            return {
              jobs: state.jobs.map((j) =>
                j.id === job.id ? {...j, ...job} : j,
              ),
            };
          }
          return {
            jobs: [
              ...state.jobs,
              {...job, status: 'running' as const, createdAt: Date.now()},
            ],
          };
        }),

      updateJobStatus: (id, status) =>
        set((state) => {
          const current = state.jobs.find((j) => j.id === id);
          if (!current || current.status === status) return state;
          return {
            jobs: state.jobs.map((j) => (j.id === id ? {...j, status} : j)),
          };
        }),

      setJobAlert: (id, alert) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? {...j, alert} : j)),
        })),

      removeJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
        })),

      clearCompleted: () =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.status === 'running'),
        })),

      clearAll: () => set({jobs: []}),
    }),
    {
      name: JOB_STORE_KEY,
      // Strip non-serializable alert content (icon ReactNodes, action callbacks).
      // The owning hook re-supplies it on mount via registerJob.
      partialize: (state) => ({
        jobs: state.jobs.map(({alert: _alert, ...rest}) => rest),
      }),
    },
  ),
);
