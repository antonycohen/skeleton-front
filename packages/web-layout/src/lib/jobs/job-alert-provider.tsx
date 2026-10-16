import {type ReactNode, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {Link, useLocation} from 'react-router-dom';
import {cn} from '@skeleton/core-utils';
import {Button} from '@skeleton/web-components';
import {useTranslation} from '@skeleton/core-translations';
import {CheckCircle2, ExternalLink, LoaderCircle, X, XCircle} from 'lucide-react';
import {useGetJobById} from '@skeleton/core-api';
import {type JobDefinition, type JobStatus, useJobStore} from './job-store';
import {JobAlertBar} from './job-alert-bar';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const statusConfig: Record<JobStatus, {icon: ReactNode; className: string}> = {
  running: {
    icon: <LoaderCircle className="size-3.5 animate-spin" />,
    className: 'text-indigo-600',
  },
  completed: {
    icon: <CheckCircle2 className="size-3.5" />,
    className: 'text-emerald-600',
  },
  failed: {
    icon: <XCircle className="size-3.5" />,
    className: 'text-red-500',
  },
};

const MONITOR_POLL_INTERVAL_MS = 3000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPathname(url: string): string {
  try {
    return url.startsWith('http') ? new URL(url).pathname : url;
  } catch {
    return url;
  }
}

// Strip query/hash from a non-http URL so `pendingUrl` values that include a
// per-job hash (e.g. `/dashboard#audience-import=abc`) still match the bare
// `useLocation().pathname` when deciding whether to show the top alert bar.
function toPagePath(url: string): string {
  if (url.startsWith('http')) return toPathname(url);
  return url.split('#')[0].split('?')[0];
}

// ---------------------------------------------------------------------------
// Background monitor — polls a single jobId and pushes status into the store
// ---------------------------------------------------------------------------

function JobMonitor({jobId, currentStatus}: {jobId: string; currentStatus: JobStatus}) {
  const updateJobStatus = useJobStore((s) => s.updateJobStatus);

  const {data} = useGetJobById(
    {
      id: jobId,
      fields: {
        id: null,
        status: null,
      },
    },
    {
      refetchInterval: MONITOR_POLL_INTERVAL_MS,
      refetchIntervalInBackground: false,
    },
  );

  useEffect(() => {
    const next = data?.status;
    if (!next || next === currentStatus) return;
    if (next === 'completed' || next === 'failed') {
      updateJobStatus(jobId, next);
    }
  }, [data?.status, currentStatus, jobId, updateJobStatus]);

  return null;
}

// ---------------------------------------------------------------------------
// Single job row
// ---------------------------------------------------------------------------

function JobRow({job, onRemove}: {job: JobDefinition; onRemove: () => void}) {
  const config = statusConfig[job.status];
  const href = job.status === 'completed' ? job.completedUrl : job.pendingUrl;

  return (
    <div className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50">
      <div className={cn('shrink-0', config.className)}>{config.icon}</div>
      <Link
        to={href}
        className="flex flex-1 items-center gap-1.5 truncate text-sm font-medium text-foreground no-underline hover:underline"
      >
        <span className="truncate">{job.name}</span>
        <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
      </Link>
      {job.status !== 'running' && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating widget
// ---------------------------------------------------------------------------

function JobAlertWidget() {
  const {t} = useTranslation();
  const jobs = useJobStore((s) => s.jobs);
  const removeJob = useJobStore((s) => s.removeJob);
  const {pathname} = useLocation();

  const visibleJobs = jobs.filter((job) => pathname !== toPathname(job.pendingUrl));

  if (visibleJobs.length === 0) return null;

  const runningCount = visibleJobs.filter((j) => j.status === 'running').length;

  return (
    <div className="fixed bottom-4 right-24 z-[9998] w-80 overflow-hidden rounded-xl border bg-background shadow-lg animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{t('layout.jobs.title')}</h3>
          {runningCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
              {runningCount}
            </span>
          )}
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto p-1">
        {visibleJobs.map((job) => (
          <JobRow key={job.id} job={job} onRemove={() => removeJob(job.id)} />
        ))}
      </div>
    </div>
  );
}

export function JobAlertProvider({children}: {children: ReactNode}) {
  const jobs = useJobStore((s) => s.jobs);
  const removeJob = useJobStore((s) => s.removeJob);
  const {pathname} = useLocation();

  // Auto-remove jobs when user reaches their completedUrl AND the job has
  // finished. Removing while still running would drop in-progress jobs the
  // moment the user navigates to the destination ahead of time.
  useEffect(() => {
    for (const job of jobs) {
      if (job.status === 'running') continue;
      // Page path, not raw string: a completedUrl carrying a deep link
      // (`/studio?pageId=…`) must still match the bare pathname.
      if (pathname === toPagePath(job.completedUrl)) {
        removeJob(job.id);
      }
    }
  }, [pathname, jobs, removeJob]);

  const runningJobs = jobs.filter((j) => j.status === 'running');
  const alertJobs = runningJobs
    .filter((job) => toPagePath(job.pendingUrl) === pathname)
    .filter((j): j is JobDefinition & {alert: NonNullable<JobDefinition['alert']>} => !!j.alert);

  // The bar is a fixed overlay; the shell (sidebar, content column, full-height
  // views) reads its height from --job-alert-height so nothing sits under it
  // and nothing has to scroll.
  const alertBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = alertBarRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const apply = () => root.style.setProperty('--job-alert-height', `${bar.offsetHeight}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--job-alert-height');
    };
  }, []);

  return (
    <>
      {/* Top alert bar (portal) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div ref={alertBarRef} className="fixed inset-x-0 top-0 z-[9999] flex flex-col">
            {alertJobs.map((job) => (
              <JobAlertBar
                key={job.id}
                alert={job.alert}
              />
            ))}
          </div>,
          document.body,
        )}
      {children}
      {/* Background monitors — no UI, just poll the API and push into the store */}
      {runningJobs.map((job) => (
        <JobMonitor key={job.id} jobId={job.id} currentStatus={job.status} />
      ))}
      {/* Floating widget (portal) */}
      {typeof document !== 'undefined' &&
        createPortal(<JobAlertWidget />, document.body)}
    </>
  );
}
