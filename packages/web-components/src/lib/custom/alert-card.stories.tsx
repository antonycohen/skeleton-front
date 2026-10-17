import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AlertCard } from './alert-card';

const meta = {
  title: 'Components/Custom/AlertCard',
  component: AlertCard,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
  args: {
    title: 'Domain verification',
    value: 'acme.com',
    status: 'success',
    statusLabel: 'Verified',
    onAction: fn(),
  },
  argTypes: { status: { control: 'select', options: ['success', 'warning', 'error'] } },
} satisfies Meta<typeof AlertCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Warning: Story = {
  args: { title: 'Seats', value: '2 left', status: 'warning', statusLabel: 'Running low', actionLabel: 'Upgrade' },
};

export const Failed: Story = {
  name: 'Error',
  args: { title: 'Slack', value: 'Disconnected', status: 'error', statusLabel: 'Token expired', actionLabel: 'Reconnect' },
};
