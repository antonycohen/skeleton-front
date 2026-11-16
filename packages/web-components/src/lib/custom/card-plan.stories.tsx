import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CardPlan } from './card-plan';

const meta = {
  title: 'Components/Custom/CardPlan',
  component: CardPlan,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-64"><Story /></div>],
  args: { onAction: fn() },
  argTypes: { variant: { control: 'select', options: ['free', 'paid'] } },
} satisfies Meta<typeof CardPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Free plan: the plan name, the headline quota with its gauge, the other quotas as rows, the upgrade button. */
export const Free: Story = {
  args: {
    planName: 'Free',
    usageStats: [
      { label: 'seats', remaining: 3, limit: 10 },
      { label: 'Projects', remaining: 2, limit: 5 },
    ],
  },
};

export const Paid: Story = {
  args: {
    variant: 'paid',
    planName: 'Pro',
    usageStats: [
      { label: 'seats', remaining: 38, limit: 50 },
      { label: 'Projects', remaining: 18, limit: 25 },
    ],
  },
};

/** At or under 30% left, the headline gauge turns amber. */
export const LowRemaining: Story = {
  args: {
    planName: 'Free',
    usageStats: [
      { label: 'seats', remaining: 2, limit: 10 },
      { label: 'Projects', remaining: 4, limit: 5 },
    ],
  },
};

/** No limit known: the remaining count alone, no gauge. */
export const UnknownLimit: Story = {
  args: {
    planName: 'Free',
    usageStats: [
      { label: 'seats', remaining: 0, limit: null },
      { label: 'Projects', remaining: 0, limit: null },
    ],
  },
};

/** A multi-workspace plan: workspaces first, then what each one gets. */
export const MultiWorkspace: Story = {
  args: {
    variant: 'paid',
    planName: 'Business',
    buttonText: 'Manage billing',
    usageStats: [
      { label: 'workspaces', remaining: 4, limit: 10 },
      { label: 'Seats', remaining: 58, limit: 75 },
      { label: 'Projects', remaining: 28, limit: 50 },
    ],
  },
};

/** Large counts are abbreviated (K, M); a quota without a limit shows the remaining count alone. */
export const LargeValues: Story = {
  args: {
    variant: 'paid',
    usageStats: [
      { label: 'API calls', remaining: 1_250_000, limit: 2_000_000 },
      { label: 'Emails', remaining: 48_200, limit: 50_000 },
      { label: 'Projects', remaining: 12, limit: null },
    ],
  },
};

/** No usage stats: the action alone. */
export const WithoutStats: Story = {};

export const WithoutAction: Story = { args: { variant: 'paid', hideAction: true } };
