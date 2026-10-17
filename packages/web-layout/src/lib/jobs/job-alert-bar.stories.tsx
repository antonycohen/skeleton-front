import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CircleAlertIcon, TriangleAlertIcon } from 'lucide-react';
import { JobAlertBar } from './job-alert-bar';

/** The bar a running job shows at the top of the page it was started from. */
const meta = {
  title: 'Layout/JobAlertBar',
  component: JobAlertBar,
  args: {
    alert: {
      message: 'Exporting 1,200 members to members.csv…',
      actions: [{ label: 'Continue in background', onClick: fn() }],
    },
  },
} satisfies Meta<typeof JobAlertBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Warning: Story = {
  args: {
    alert: {
      variant: 'warning',
      icon: <TriangleAlertIcon className="size-4" />,
      message: 'Import paused: 12 rows of members.csv have no email address.',
      actions: [
        { label: 'Skip them', onClick: fn() },
        { label: 'Review', onClick: fn() },
      ],
    },
  },
};

export const Destructive: Story = {
  args: {
    alert: {
      variant: 'destructive',
      icon: <CircleAlertIcon className="size-4" />,
      message: 'The export of the audit log failed.',
      actions: [{ label: 'Retry', onClick: fn() }],
    },
  },
};

export const WithoutActions: Story = {
  args: { alert: { message: 'Preparing your export…' } },
};
