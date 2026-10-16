import {useCallback, useEffect, useRef, useState} from 'react';
import {useJobStore, type JobStatus} from './job-store';
import type {JobAlertBarOptions} from './job-alert-bar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseJobAlertOptions {
  tag?: string;
  /** Display name in the floating widget */
  name: string;
  /** URL to navigate to while job is still running */
  pendingUrl: string;
  /** URL to navigate to once job completes */
  completedUrl: string;
  /** Optional top alert bar. If omitted, the job is tracked silently in the floating widget. */
  alert?: JobAlertBarOptions;
  /** Fired the first time `start(jobId)` registers a new job in the store
   *  (re-registering the same id is treated as a merge and does not refire). */
  onStart?: (jobId: string) => void;
  /** Fired once the registered job transitions to a terminal status. Status
   *  changes are observed from the global job-store, which is kept in sync by
   *  `JobAlertProvider`'s background `JobMonitor`. */
  onTerminal?: (status: 'completed' | 'failed') => void;
}

export function useJobAlert({tag, name, pendingUrl, completedUrl, alert, onStart, onTerminal}: UseJobAlertOptions) {
  const registerJob = useJobStore((s) => s.registerJob);
  const removeJob = useJobStore((s) => s.removeJob);

  // Keep alert in a ref so `start` stays referentially stable across renders
  // (callers create the alert object inline each render).
  const alertRef = useRef(alert);
  useEffect(() => {
    alertRef.current = alert;
  });

  // Track the id of the most recently started job so we can subscribe to its
  // status transitions for `onTerminal`.
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);

  // Keep `onStart` in a ref so `start` stays referentially stable while
  // still firing the latest callback when invoked.
  const onStartRef = useRef(onStart);
  useEffect(() => {
    onStartRef.current = onStart;
  });

  // Track which job ids we've already announced via `onStart` so re-registering
  // the same id (the registerJob merge path) doesn't refire the callback.
  const startedIdsRef = useRef<Set<string>>(new Set());

  /** Register the job and show the alert bar. Idempotent — re-registering merges. */
  const start = useCallback(
    (jobId: string) => {
      registerJob({
        id: jobId,
        tag,
        name,
        pendingUrl,
        completedUrl,
        ...(alertRef.current !== undefined ? {alert: alertRef.current} : {}),
      });
      setTrackedJobId(jobId);
      if (!startedIdsRef.current.has(jobId)) {
        startedIdsRef.current.add(jobId);
        onStartRef.current?.(jobId);
      }
    },
    [name, tag, pendingUrl, completedUrl, registerJob],
  );

  /** Hide the top alert bar but keep tracking the job in the floating widget. */
  const dismissAlert = useCallback(
    (jobId: string) => {
      removeJob(jobId);
    }, [removeJob]
  );

  /** Remove the job entirely (top bar + widget). */
  const stop = useCallback(
    (jobId: string) => {
      removeJob(jobId);
    }, [removeJob]
  );

  // Watch the tracked job's status and fire `onTerminal` on the running →
  // terminal edge.
  const status = useJobStore((s): JobStatus | null => {
    if (!trackedJobId) return null;
    return s.jobs.find((j) => j.id === trackedJobId)?.status ?? null;
  });
  const prevStatusRef = useRef<JobStatus | null>(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev === status) return;
    if (status === 'completed' || status === 'failed') {
      onTerminal?.(status);
    }
  }, [status, onTerminal]);

  return {start, dismissAlert, stop};
}
