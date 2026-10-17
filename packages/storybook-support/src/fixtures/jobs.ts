import { readJobSchema, type DataExportState, type ReadJob } from '@skeleton/core-api-models';
import { daysAgo, make, STORYBOOK_NOW, uuid } from './make';
import { WORKSPACE_ID } from './session';

const minutesAgo = (minutes: number) => new Date(STORYBOOK_NOW.getTime() - minutes * 60_000).toISOString();

/** A background job of the current workspace (`data_export` by default, the job type the API declares). */
export const makeJob = (n: number, overrides: Partial<ReadJob> = {}): ReadJob =>
  make(readJobSchema, {
    id: uuid(n, '0d000000'),
    name: 'data_export',
    status: 'running',
    progress: 0,
    tenantId: WORKSPACE_ID,
    createdAt: minutesAgo(5),
    updatedAt: minutesAgo(1),
    ...overrides,
  });

const exportState = (total: number, processed: number): DataExportState => ({ total, processed });

/** One job per status worth showing. `GET /jobs/:id` answers them by id. */
export const jobs = {
  /** A members export under way: 480 of 1,200 rows written. */
  running: makeJob(1, {
    status: 'running',
    progress: 40,
    state: exportState(1200, 480),
    startedAt: minutesAgo(4),
  }),
  /** Waiting for a worker. */
  queued: makeJob(2, { status: 'queued', progress: 0, state: exportState(350, 0), createdAt: minutesAgo(1) }),
  completed: makeJob(3, {
    status: 'completed',
    progress: 100,
    state: exportState(86, 86),
    createdAt: daysAgo(1),
    startedAt: daysAgo(1),
    completedAt: daysAgo(1),
    updatedAt: daysAgo(1),
  }),
  failed: makeJob(4, {
    status: 'failed',
    progress: 15,
    state: exportState(5400, 810),
    errorCode: 'export_failed',
    errorMessage: 'The export file could not be written. Try again in a few minutes.',
    createdAt: daysAgo(2),
    startedAt: daysAgo(2),
    completedAt: daysAgo(2),
    updatedAt: daysAgo(2),
  }),
} satisfies Record<string, ReadJob>;

/** Every job, newest first, as `GET /jobs` lists them. */
export const jobList: ReadJob[] = [jobs.queued, jobs.running, jobs.completed, jobs.failed];
