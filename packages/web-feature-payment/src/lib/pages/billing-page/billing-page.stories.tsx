import type { Meta, StoryObj } from '@storybook/react-vite';
import { billingWorkspaces, type ScreenParameters } from '@skeleton/storybook-support';
import { BillingPage } from './billing-page';

/**
 * Workspace settings › Billing. The plan comes from the open workspace (`parameters.workspace`).
 * "Upgrade to Pro" opens the paywall, which the settings shell mounts as the app does.
 */
const meta = {
  title: 'Screens/Billing/Billing',
  component: BillingPage,
  parameters: {
    screen: { path: 'settings/billing' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof BillingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pro plan, paid monthly. */
export const Default: Story = {};

/** No subscription: managing and cancelling are disabled, the summary offers the upgrade. */
export const Free: Story = { parameters: { workspace: 'free' } };

/** Every quota of the period used up. */
export const OverQuota: Story = { parameters: { workspace: 'overQuota' } };

export const Yearly: Story = { parameters: { workspace: billingWorkspaces.yearly } };

/** Cancellation scheduled at the end of the period: a banner offers to reactivate. */
export const CancelScheduled: Story = { parameters: { workspace: billingWorkspaces.cancelScheduled } };

/** The latest invoice is overdue: the shell banner and the page alert ask to pay it. */
export const PastDue: Story = { parameters: { workspace: billingWorkspaces.pastDue } };
