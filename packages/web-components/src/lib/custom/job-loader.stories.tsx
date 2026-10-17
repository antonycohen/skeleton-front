import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DatabaseIcon, FileSpreadsheetIcon, MailIcon, UsersIcon } from 'lucide-react';
import { JobLoader, useJobsSimulationConfiguration, type StepDefinition, type SubJob } from './job-loader';

const base = { progress: 0, strategy: 'exponentialBackoff', simulateProgress: false } as const;

const jobs: SubJob[] = [
  { ...base, title: 'Reading your file', icon: <FileSpreadsheetIcon />, status: 'completed' },
  { ...base, title: 'Matching the columns', icon: <DatabaseIcon />, status: 'completed' },
  { ...base, title: 'Creating the members', icon: <UsersIcon />, status: 'ongoing', progress: 62 },
  { ...base, title: 'Sending the invitations', icon: <MailIcon />, status: 'queued' },
];

const meta = {
  title: 'Components/Custom/JobLoader',
  component: JobLoader,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-[480px]"><Story /></div>],
  args: { subJobs: jobs },
} satisfies Meta<typeof JobLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Queued: Story = {
  args: { subJobs: jobs.map((job) => ({ ...job, status: 'queued' as const, progress: 0 })) },
};

export const Completed: Story = {
  args: { subJobs: jobs.map((job) => ({ ...job, status: 'completed' as const })) },
};

export const Failed: Story = {
  name: 'Error',
  args: {
    subJobs: [
      jobs[0],
      { ...jobs[1], status: 'error', errorMessage: 'Column "email" not found in the file.', onRetry: fn() },
      { ...jobs[2], status: 'queued', progress: 0 },
      jobs[3],
    ],
  },
};

const steps: StepDefinition[] = [
  { title: 'Reading your file', icon: <FileSpreadsheetIcon />, duration: 3, strategy: 'linear' },
  { title: 'Matching the columns', icon: <DatabaseIcon />, duration: 4, strategy: 'exponentialBackoff' },
  { title: 'Creating the members', icon: <UsersIcon />, duration: 5, strategy: 'randomProgress' },
  { title: 'Sending the invitations', icon: <MailIcon />, duration: 6, strategy: 'exponentialBackoff' },
];

/** Driven by `useJobsSimulationConfiguration`: steps advance on their estimated durations. */
export const Simulated: Story = {
  render: function Render() {
    const { subJobs } = useJobsSimulationConfiguration({ steps, isAnalysisCompleted: false });
    return <JobLoader subJobs={subJobs} />;
  },
};
