import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlanBadge } from './plan-badge';

const meta = {
  title: 'Components/Custom/PlanBadge',
  component: PlanBadge,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PlanBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Defaults to "Pro". */
export const Default: Story = {};

export const Business: Story = { args: { label: 'Business' } };

export const Enterprise: Story = { args: { label: 'Enterprise' } };
