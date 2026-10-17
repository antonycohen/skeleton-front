import type { Meta, StoryObj } from '@storybook/react-vite';
import { billingWorkspaces, type ScreenParameters } from '@skeleton/storybook-support';
import { PastDueInvoiceBanner } from './past-due-invoice-banner';

/**
 * The banner above every app page while the latest invoice is open past its due date. Renders
 * nothing otherwise, so the only story is the past-due one.
 */
const meta = {
  title: 'Screens/Billing/Past due banner',
  component: PastDueInvoiceBanner,
  parameters: {
    workspace: billingWorkspaces.pastDue,
    screen: { path: 'dashboard', layout: 'bare' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof PastDueInvoiceBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PastDue: Story = {};
