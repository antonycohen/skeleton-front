import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeStatus, type BadgeStatusVariant } from './badge-status';

const VARIANTS: BadgeStatusVariant[] = ['green', 'yellow', 'red', 'blue', 'pricing'];

const meta = {
  title: 'Components/Custom/BadgeStatus',
  component: BadgeStatus,
  parameters: { layout: 'centered' },
  args: { variant: 'green', children: 'Active' },
  argTypes: { variant: { control: 'select', options: VARIANTS } },
} satisfies Meta<typeof BadgeStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Green: Story = {};

export const Yellow: Story = { args: { variant: 'yellow', children: 'Trial ends in 3 days' } };

export const Red: Story = { args: { variant: 'red', children: 'Payment failed' } };

export const Blue: Story = { args: { variant: 'blue', children: 'Scheduled' } };

/** No dot, teal: a pricing tag. */
export const Pricing: Story = { args: { variant: 'pricing', children: 'Save 20%' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((variant) => (
        <BadgeStatus key={variant} variant={variant}>{variant}</BadgeStatus>
      ))}
    </div>
  ),
};
