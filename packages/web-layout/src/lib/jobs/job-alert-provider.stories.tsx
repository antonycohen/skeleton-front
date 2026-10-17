import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Link } from 'react-router-dom';
import { jobs, STORYBOOK_NOW, WORKSPACE_ID } from '@skeleton/storybook-support';
import { JobAlertProvider } from './job-alert-provider';
import { useJobStore, type JobDefinition } from './job-store';

const BASE = `/w/${WORKSPACE_ID}`;

/** A job of the store, backed by a fixture job (`GET /jobs/:id` answers it while it runs). */
const job = (id: string | null, overrides: Partial<JobDefinition>): JobDefinition => ({
  id: id as string,
  name: 'Job',
  pendingUrl: `${BASE}/settings/account`,
  completedUrl: `${BASE}/settings/account`,
  status: 'running',
  createdAt: STORYBOOK_NOW.getTime(),
  ...overrides,
});

const exporting = job(jobs.running.id, {
  name: 'Export members.csv',
  pendingUrl: `${BASE}/settings/teams`,
  completedUrl: `${BASE}/settings/teams`,
  alert: {
    message: 'Exporting 1,200 members to members.csv…',
    actions: [{ label: 'Continue in background', onClick: fn() }],
  },
});
const queued = job(jobs.queued.id, { name: 'Export invoices.csv', pendingUrl: `${BASE}/settings/billing` });
const done = job(jobs.completed.id, { name: 'Export activity.csv', status: 'completed', completedUrl: `${BASE}/account/profile` });
const failed = job(jobs.failed.id, { name: 'Export audit-log.csv', status: 'failed' });

function Page() {
  return (
    <div className="p-8 pt-[calc(var(--job-alert-height,0px)+2rem)] text-sm text-muted-foreground">
      The page content. <Link className="underline" to={`${BASE}/dashboard`}>Go to the dashboard</Link>
    </div>
  );
}

/**
 * Tracks background jobs: a top bar on the page a job was started from, a floating widget
 * everywhere else, and a poll of `GET /jobs/:id` while each job runs (the mocked jobs keep running).
 */
const meta = {
  title: 'Layout/JobAlertProvider',
  component: JobAlertProvider,
  args: { children: <Page /> },
  parameters: {
    router: { url: `${BASE}/settings/teams` },
  },
  beforeEach: () => {
    useJobStore.setState({ jobs: [exporting, queued, done, failed] });
    return () => useJobStore.setState({ jobs: [] });
  },
} satisfies Meta<typeof JobAlertProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On the export's own page: its top bar, the other jobs in the widget. */
export const OnPendingPage: Story = {};

/** Elsewhere: every job in the widget, no top bar. */
export const Elsewhere: Story = { parameters: { router: { url: `${BASE}/dashboard` } } };

export const NoJobs: Story = {
  beforeEach: () => {
    useJobStore.setState({ jobs: [] });
  },
};
