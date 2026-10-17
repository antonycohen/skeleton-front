import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ScreenParameters } from '@skeleton/storybook-support';
import { PaywallProRequiredModal } from '../modal/paywall-pro-required-modal/paywall-pro-required-modal';
import { SubscriptionPlanCard } from './plan-card';

/** The plan card at the bottom of the app sidebar: what is left of each quota of the plan. */
const meta = {
  title: 'Screens/Billing/Plan card',
  component: SubscriptionPlanCard,
  decorators: [
    (Story) => (
      <div className="w-64 p-4">
        <Story />
        <PaywallProRequiredModal />
      </div>
    ),
  ],
  parameters: {
    screen: { path: 'dashboard', layout: 'bare' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof SubscriptionPlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Paid plan: the button opens the Stripe customer portal. */
export const Default: Story = {};

/** Free plan: the button opens the paywall. */
export const Free: Story = { parameters: { workspace: 'free' } };

export const OverQuota: Story = { parameters: { workspace: 'overQuota' } };
