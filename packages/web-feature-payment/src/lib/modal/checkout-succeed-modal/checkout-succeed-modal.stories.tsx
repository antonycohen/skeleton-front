import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { ScreenParameters } from '@skeleton/storybook-support';
import { CheckoutSucceedModal } from './checkout-succeed-modal';

/** Opened by Stripe's success URL (`#checkout-succeed`); lists the new plan's quotas. */
const meta = {
  title: 'Screens/Billing/Checkout succeeded modal',
  component: CheckoutSucceedModal,
  args: { onClose: fn() },
  parameters: {
    screen: { path: 'dashboard', url: 'dashboard#checkout-succeed', layout: 'bare' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof CheckoutSucceedModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const WithManageSubscription: Story = { args: { onManageSubscription: fn() } };
