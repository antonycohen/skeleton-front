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

/** Free plan: the gradient border and the upgrade button. */
export const Free: Story = {
  args: {
    usageStats: [
      { value: 3, label: 'seats left', percent: 30 },
      { value: 2, label: 'projects left', percent: 40 },
    ],
  },
};

export const Paid: Story = {
  args: {
    variant: 'paid',
    usageStats: [
      { value: 38, label: 'seats left', percent: 76 },
      { value: 18, label: 'projects left', percent: 72 },
    ],
  },
};

/** A multi-workspace plan: workspaces first, then what each one gets. */
export const MultiWorkspace: Story = {
  args: {
    variant: 'paid',
    title: 'Business plan',
    buttonText: 'Manage billing',
    usageStats: [
      { value: 4, label: 'workspaces left', percent: 40 },
      { value: 58, label: 'seats left', percent: 77 },
      { value: 28, label: 'projects left', percent: 56 },
    ],
  },
};

/** Large counts are abbreviated (K, M); a string is shown as is. */
export const LargeValues: Story = {
  args: {
    variant: 'paid',
    usageStats: [
      { value: 1_250_000, label: 'API calls left', percent: 62 },
      { value: 48_200, label: 'emails left', percent: 96 },
      { value: 'Unlimited', label: 'projects', percent: 100 },
    ],
  },
};

/** No usage stats: the title and the action alone. */
export const WithoutStats: Story = {};

export const WithoutAction: Story = { args: { variant: 'paid', hideAction: true } };
