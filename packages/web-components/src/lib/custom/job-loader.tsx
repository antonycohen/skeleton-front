import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { Button } from '../ui/button';

export type SubJobStatus = 'completed' | 'ongoing' | 'queued' | 'error';

export type ProgressStrategy = 'exponentialBackoff' | 'linear' | 'randomProgress';

export type SubJob = {
  title: string;
  status: SubJobStatus;
  icon: ReactNode;
  iconFill?: boolean;
  progress: number;
  strategy: ProgressStrategy;
  simulateProgress: boolean;
  simulationEstimatedTimeInSeconds?: number;
  simulationDelayBeforeStartingInSeconds?: number;
  simulationStartedAt?: string | Date | null;
  errorMessage?: string;
  onRetry?: () => void;
};

export type JobLoaderProps = {
  subJobs: SubJob[];
  className?: string;
};

export function JobLoader({ subJobs, className }: JobLoaderProps) {
  return (
    <div
      data-slot="job-loader"
      className={cn(
        'flex w-full flex-col gap-1 rounded-xl border border-border p-4',
        className
      )}
    >
      {subJobs.map((subJob, index) => (
        <SubJobItem key={index} subJob={subJob} />
      ))}
    </div>
  );
}

function useAnimatedProgress(
  externalProgress: number,
  status: SubJobStatus,
  simulateProgress: boolean,
  strategy: ProgressStrategy,
  simulationEstimatedTimeInSeconds: number,
  simulationDelayBeforeStartingInSeconds: number,
  simulationStartedAt: string | Date | null | undefined
) {
  const [displayProgress, setDisplayProgress] = useState(
    status === 'completed' ? 100 : externalProgress
  );
  const progressRef = useRef(displayProgress);
  const simulationStartRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync
  useEffect(() => {
    progressRef.current = displayProgress;
  }, [displayProgress]);

  // Animate to target value
  const animateTo = useCallback((target: number, duration = 300) => {
    const startProgress = progressRef.current;
    if (target <= startProgress) return;

    const progressDiff = target - startProgress;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newProgress = startProgress + progressDiff * eased;

      setDisplayProgress(newProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Handle progress simulation
  useEffect(() => {
    if (!simulateProgress || status !== 'ongoing') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
      return;
    }

    const estimatedMs = simulationEstimatedTimeInSeconds * 1000;
    const delayMs = simulationDelayBeforeStartingInSeconds * 1000;
    const targetProgress = 90;
    const updateInterval = 100;

    const startSimulation = () => {
      const seededStart = simulationStartedAt
        ? new Date(simulationStartedAt).getTime()
        : NaN;
      simulationStartRef.current = Number.isFinite(seededStart)
        ? seededStart
        : Date.now();

      const simulate = () => {
        const elapsed = Date.now() - simulationStartRef.current;
        let newProgress: number;

        switch (strategy) {
          case 'exponentialBackoff': {
            const k = 2.3 / estimatedMs;
            const factor = 1 - Math.exp(-k * elapsed);
            newProgress = targetProgress * factor;
            break;
          }
          case 'linear': {
            newProgress = Math.min(
              targetProgress,
              (elapsed / estimatedMs) * targetProgress
            );
            break;
          }
          case 'randomProgress': {
            const baseProgress = (elapsed / estimatedMs) * targetProgress;
            const randomOffset = (Math.random() - 0.5) * 10;
            newProgress = Math.max(
              0,
              Math.min(targetProgress, baseProgress + randomOffset)
            );
            break;
          }
          default:
            newProgress = progressRef.current;
        }

        setDisplayProgress((current) => Math.max(current, newProgress));
      };

      simulate();
      intervalRef.current = setInterval(simulate, updateInterval);
    };

    if (delayMs > 0) {
      delayTimeoutRef.current = setTimeout(startSimulation, delayMs);
    } else {
      startSimulation();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [
    simulateProgress,
    status,
    strategy,
    simulationEstimatedTimeInSeconds,
    simulationDelayBeforeStartingInSeconds,
    simulationStartedAt,
  ]);

  // Handle external progress updates
  useEffect(() => {
    if (externalProgress > progressRef.current) {
      animateTo(externalProgress, 300);
    }
  }, [externalProgress, animateTo]);

  // Handle completed status
  useEffect(() => {
    if (status === 'completed') {
      animateTo(100, 400);
    }
  }, [status, animateTo]);

  return displayProgress;
}

// ============================================================================
// useAnalysisJobs hook
// ============================================================================

export type StepDefinition = {
  title: string;
  icon: ReactNode;
  duration: number;
  strategy: ProgressStrategy;
};

const COMPLETION_ANIMATION_MS = 500;

type UseAnalysisJobsOptions = {
  steps: StepDefinition[];
  isAnalysisCompleted: boolean;
  startedAt?: string | Date | null;
};

type UseAnalysisJobsResult = {
  subJobs: SubJob[];
  allCompleted: boolean;
  remainingSeconds: number;
};

export function useJobsSimulationConfiguration({ steps, isAnalysisCompleted, startedAt }: UseAnalysisJobsOptions): UseAnalysisJobsResult {
  const lastIndex = steps.length - 1;
  const [allCompleted, setAllCompleted] = useState(false);

  // Cumulative durations in seconds: [0, d0, d0+d1, ..., total]
  const cumulativeDurations = useMemo(() => {
    const acc: number[] = [0];
    for (const s of steps) acc.push(acc[acc.length - 1] + s.duration);
    return acc;
  }, [steps]);
  const totalDuration = cumulativeDurations[cumulativeDurations.length - 1];

  // Anchor the simulation to the job's startedAt so progress resumes correctly
  // across remounts. Falls back to first-render time until startedAt arrives —
  // sampled in a state initializer so it really is the first render, rather than
  // whenever the memo below happens to recompute.
  const [firstRenderMs] = useState(() => Date.now());
  const startTimeMs = useMemo(() => {
    if (!startedAt) return firstRenderMs;
    const t = new Date(startedAt).getTime();
    return Number.isFinite(t) ? t : firstRenderMs;
  }, [startedAt, firstRenderMs]);

  // Tick to recompute the active step over time
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (isAnalysisCompleted) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [isAnalysisCompleted]);

  const elapsedSec = Math.max(0, (now - startTimeMs) / 1000);

  // Largest index whose step has fully elapsed; capped at lastIndex while running
  let derivedIndex = 0;
  for (let i = 0; i < lastIndex; i++) {
    if (elapsedSec >= cumulativeDurations[i + 1]) derivedIndex = i + 1;
    else break;
  }

  const activeJobIndex = isAnalysisCompleted ? lastIndex + 1 : derivedIndex;

  // Signal allCompleted after the completion animation finishes
  useEffect(() => {
    if (activeJobIndex <= lastIndex) return;
    const timeout = setTimeout(() => {
      setAllCompleted(true);
    }, COMPLETION_ANIMATION_MS);
    return () => clearTimeout(timeout);
  }, [activeJobIndex, lastIndex]);

  const subJobs: SubJob[] = steps.map((step, index) => ({
    title: step.title,
    icon: step.icon,
    status: index < activeJobIndex ? 'completed' as const : index === activeJobIndex ? 'ongoing' as const : 'queued' as const,
    progress: 0,
    strategy: step.strategy,
    simulateProgress: true,
    simulationEstimatedTimeInSeconds: step.duration,
    simulationStartedAt: index === activeJobIndex
      ? new Date(startTimeMs + cumulativeDurations[index] * 1000)
      : undefined,
  }));

  const remainingSeconds = isAnalysisCompleted
    ? 0
    : Math.max(0, totalDuration - elapsedSec);

  return { subJobs, allCompleted, remainingSeconds };
}

// ============================================================================
// SubJobItem
// ============================================================================

function SubJobItem({ subJob }: { subJob: SubJob }) {
  const {
    title,
    status,
    icon,
    iconFill,
    progress: externalProgress,
    strategy,
    simulateProgress,
    simulationEstimatedTimeInSeconds = 30,
    simulationDelayBeforeStartingInSeconds = 0,
    simulationStartedAt,
    errorMessage,
    onRetry,
  } = subJob;

  const displayProgress = useAnimatedProgress(
    externalProgress,
    status === 'error' ? 'queued' : status,
    simulateProgress,
    strategy,
    simulationEstimatedTimeInSeconds,
    simulationDelayBeforeStartingInSeconds,
    simulationStartedAt
  );

  const { t } = useTranslation();
  const isCompleted = status === 'completed';
  const isOngoing = status === 'ongoing';
  const isQueued = status === 'queued';
  const isError = status === 'error';

  return (
    <div className="flex h-14 w-full items-center gap-3 rounded-2xl p-2">
      {/* Icon container */}
      {iconFill ? (
        <div className="size-10 shrink-0 overflow-hidden rounded-md">
          {icon}
        </div>
      ) : (
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-md',
            isCompleted && 'bg-muted',
            (isOngoing || isQueued || isError) && 'border border-border'
          )}
        >
          <span
            className={cn(
              'flex size-4 items-center justify-center [&>svg]:size-4',
              (isQueued || isError) && 'text-muted-foreground'
            )}
          >
            {icon}
          </span>
        </div>
      )}

      {/* Content area */}
      <div className="flex h-full min-w-0 flex-1 items-center">
        {isError ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
              <p className="text-sm font-medium leading-5 text-foreground">
                {title}
              </p>
              <div className="flex items-center gap-1">
                <CircleAlert className="size-4 text-destructive" />
                <p className="text-xs leading-[18px] text-destructive">{errorMessage ?? t('components.jobLoader.error')}</p>
              </div>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" className="h-8 shrink-0 text-xs" onClick={onRetry}>
                {t('components.jobLoader.retry')}
              </Button>
            )}
          </div>
        ) : isCompleted ? (
          <div className="flex flex-col items-start justify-center">
            <p className="text-sm font-medium leading-5 text-foreground">
              {title}
            </p>
            <div className="flex items-center gap-1">
              <Check className="size-4 text-teal-500" />
              <p className="text-xs leading-[18px] text-teal-500">{t('components.jobLoader.completed')}</p>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
            <p className="text-sm font-medium leading-5 text-muted-foreground">
              {title}
            </p>
            {isOngoing && (
              <div className="flex w-full items-center gap-3">
                <div
                  className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgb(99, 102, 241) 0%, rgb(99, 102, 241) 100%)',
                  }}
                >
                  <div
                    className="absolute left-0 top-0 h-2 bg-primary transition-[width] duration-100"
                    style={{ width: `${displayProgress}%` }}
                  />
                </div>
                <div className="flex w-14 shrink-0 items-center justify-end gap-1">
                  <span className="text-xs text-muted-foreground">
                    {Math.round(displayProgress)}%
                  </span>
                  <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
