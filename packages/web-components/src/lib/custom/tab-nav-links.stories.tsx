import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabNavLinks } from './tab-nav-links';

const meta = {
  title: 'Components/Custom/TabNavLinks',
  component: TabNavLinks,
  parameters: { layout: 'padded', router: { url: '/projects/q4-roadmap/tasks' } },
  args: {
    items: [
      { title: 'Overview', url: '/projects/q4-roadmap' },
      { title: 'Tasks', url: '/projects/q4-roadmap/tasks' },
      { title: 'Members', url: '/projects/q4-roadmap/members' },
      { title: 'Analytics', url: '/projects/q4-roadmap/analytics', disabled: true },
    ],
  },
} satisfies Meta<typeof TabNavLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The active tab follows the router address (click to switch). */
export const Default: Story = {};

/** `matchNested` keeps "Security" active on its sub-routes. */
export const NestedMatch: Story = {
  parameters: { router: { url: '/settings/security/sso' } },
  args: {
    items: [
      { title: 'General', url: '/settings' },
      { title: 'Security', url: '/settings/security', matchNested: true },
      { title: 'Billing', url: '/settings/billing' },
    ],
  },
};
