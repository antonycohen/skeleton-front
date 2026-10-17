import type { Meta, StoryObj } from '@storybook/react-vite';
import { mock, type ScreenParameters } from '@skeleton/storybook-support';
import { PaywallProRequiredModal } from './paywall-pro-required-modal';

/**
 * Opened through the address hash (`#paywall-pro?reason=…`, see `useOpenPaywall`). The upgrade
 * section offers every product of the `pg_pro` product group (Pro, Business), monthly or yearly.
 */
const at = (hash: string) =>
  ({ path: 'dashboard', url: `dashboard#${hash}`, layout: 'bare' }) satisfies ScreenParameters;

const meta = {
  title: 'Screens/Billing/Paywall',
  component: PaywallProRequiredModal,
  parameters: {
    workspace: 'free',
    screen: { path: 'dashboard', url: 'dashboard#paywall-pro', layout: 'bare' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof PaywallProRequiredModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Free plan, no reason given. */
export const Default: Story = {};

/** A role only paid plans have was picked in the team settings. */
export const Role: Story = { parameters: { screen: at('paywall-pro?reason=role') } };

/** AI messages used up: the current plan's usage is summarised above the upgrade. */
export const QuotaExceeded: Story = {
  parameters: { workspace: 'overQuota', screen: at('paywall-pro?reason=quota_exceeded&quota=ai_messages') },
};

/** Every seat taken, from the member invitation. */
export const SeatsExceeded: Story = {
  parameters: { workspace: 'overQuota', screen: at('paywall-pro?reason=quota_exceeded&quota=seats') },
};

/** Single sign-on has no self-serve price: no upgrade section, the footer sends to sales. */
export const SalesOnly: Story = { parameters: { workspace: 'default', screen: at('paywall-pro?reason=sso') } };

/** Already on Pro, asked to upgrade further. */
export const PaidPlan: Story = { parameters: { workspace: 'default' } };

/** The product group has not loaded: no options and no price yet. */
export const Loading: Story = { parameters: { msw: [mock.loading('/public/product-groups/:id')] } };
