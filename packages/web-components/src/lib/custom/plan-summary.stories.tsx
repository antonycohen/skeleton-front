import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PlanSummary } from './plan-summary';

const meta = {
  title: 'Components/Custom/PlanSummary',
  component: PlanSummary,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-4xl"><Story /></div>],
  args: {
    planName: 'Free',
    badgeStatusVariant: 'green',
    badgeStatusLabel: 'Active',
    usageMetrics: [
      { value: 3, label: 'seats left', percent: 60 },
      { value: 4, label: 'projects left', percent: 40 },
    ],
    price: '€0',
    priceLabel: 'Free forever',
    included: [
      { value: '5', label: 'seats' },
      { value: '10', label: 'projects' },
    ],
    subscriptionDate: 'Aug 12, 2026',
    usagePeriod: 'Oct 1 – Oct 31',
    usagePeriodReset: 'Resets in 24 days',
    onUpgrade: fn(),
  },
  argTypes: { badgeStatusVariant: { control: 'select', options: ['green', 'red', 'yellow', 'blue', 'pricing'] } },
} satisfies Meta<typeof PlanSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Free: Story = {};

export const Pro: Story = {
  args: {
    planName: 'Pro',
    isPro: true,
    usageMetrics: [
      { value: 18, label: 'seats left', percent: 72 },
      { value: 52, label: 'projects left', percent: 69 },
      { value: 48_200, label: 'API calls', percent: 48 },
    ],
    price: '€249',
    priceLabel: 'per month, billed yearly',
    included: [
      { value: '25', label: 'seats' },
      { value: '75', label: 'projects' },
      { value: '100000', label: 'API calls' },
    ],
    hideUpgrade: true,
  },
};

export const PaymentFailed: Story = {
  args: { planName: 'Starter', badgeStatusVariant: 'red', badgeStatusLabel: 'Payment failed', price: '€99', priceLabel: 'per month', upgradeLabel: 'Update payment method' },
};

export const Compact: Story = { args: { compact: true } };
