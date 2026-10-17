import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckIcon } from 'lucide-react';
import { Badge } from './badge';

const VARIANTS = ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'important'] as const;

const meta = {
  title: 'Components/UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  args: { children: 'Draft' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: 'secondary', children: 'Enterprise' } };

export const Destructive: Story = { args: { variant: 'destructive', children: 'Failed' } };

export const Outline: Story = { args: { variant: 'outline', children: 'Paused' } };

export const Success: Story = { args: { variant: 'success', children: <><CheckIcon /> Published</> } };

export const Warning: Story = { args: { variant: 'warning', children: 'Payment due' } };

export const Important: Story = { args: { variant: 'important', children: 'New' } };

/** Every variant. */
export const Matrix: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((variant) => (
        <Badge key={variant} {...args} variant={variant}>{variant}</Badge>
      ))}
    </div>
  ),
};
