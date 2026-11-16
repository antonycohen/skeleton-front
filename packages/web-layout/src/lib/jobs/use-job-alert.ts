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
  /** Serializable context stored with the job (see `JobDefinition.meta`). */
  meta?: Record<string, string>;
  /**
   * Whether a new job also replaces an ended run of the same name, tag and pending URL that this
   * mount did not start (one registered before a reload of its page). Only for a caller whose
   * pending URL names one thing, e.g. one record's build page: a bulk import's does not.
   */
  replacesEndedRuns?: boolean;
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

export function useJobAlert({tag, name, pendingUrl, completedUrl, meta, replacesEndedRuns = false, alert, onStart, onTerminal}: UseJobAlertOptions) {
  const registerJob = useJobStore((s) => s.registerJob);
  const removeJob = useJobStore((s) => s.removeJob);

  // Keep alert in a ref so `start` stays referentially stable across renders
  // (callers create the alert object inline each render).
  const alertRef = useRef(alert);
  useEffect(() => {
    alertRef.current = alert;
  });
  // Same for the meta, built inline too.
  const metaRef = useRef(meta);
  useEffect(() => {
    metaRef.current = meta;
  });

  // Track the id of the most recently started job so we can subscribe to its
  // status transitions for `onTerminal`.
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  // The same, read synchronously by `start`.
  const trackedJobIdRef = useRef<string | null>(null);


  // Keep `onStart` in a ref so `start` stays referentially stable while
  // still firing the latest callback when invoked.
  const onStartRef = useRef(onStart);
  useEffect(() => {
    onStartRef.current = onStart;
  });

  // Track which job ids we've already announced via `onStart` so re-registering
  // the same id (the registerJob merge path) doesn't refire the callback.
  const startedIdsRef = useRef<Set<string>>(new Set());

  /**
   * Register the job and show the alert bar. Idempotent — re-registering merges. A new id after the
   * tracked job ended (a retry: every run is a new job) takes its place in the widget: the ended run
   * no longer stands beside the one under way. With `replacesEndedRuns`, so does an ended run of the
   * same name, tag and pending URL registered before this mount.
   */
  const start = useCallback(
    (jobId: string) => {
      const previous = trackedJobIdRef.current;
      for (const job of useJobStore.getState().jobs) {
        const ended = job.status === 'completed' || job.status === 'failed';
        const sameRun =
          job.id === previous || (replacesEndedRuns && job.pendingUrl === pendingUrl && job.name === name && job.tag === tag);
        if (job.id !== jobId && ended && sameRun) removeJob(job.id);
      }
      trackedJobIdRef.current = jobId;
      registerJob({
        id: jobId,
        tag,
        name,
        pendingUrl,
        completedUrl,
        ...(metaRef.current !== undefined ? {meta: metaRef.current} : {}),
        ...(alertRef.current !== undefined ? {alert: alertRef.current} : {}),
      });
      setTrackedJobId(jobId);
      if (!startedIdsRef.current.has(jobId)) {
        startedIdsRef.current.add(jobId);
        onStartRef.current?.(jobId);
      }
    },
    [name, tag, pendingUrl, completedUrl, replacesEndedRuns, registerJob, removeJob],
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
