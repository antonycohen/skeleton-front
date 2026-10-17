import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { WORKSPACE_ID, workspaceWithSso, type ScreenParameters } from '@skeleton/storybook-support';
import { SsoEnforcementModal } from './sso-enforcement-modal';

/** Confirms requiring (or lifting) single sign-on, from the security page or the back office. */
const meta = {
  title: 'Screens/Settings/Modals/SSO enforcement',
  component: SsoEnforcementModal,
  args: {
    open: true,
    onOpenChange: fn(),
    organizationId: WORKSPACE_ID,
    enforced: true,
    membersOnVerifiedDomainsCount: 5,
    membersCountIsPartial: false,
  },
  parameters: {
    screen: { path: 'settings/security' } satisfies ScreenParameters,
    workspace: workspaceWithSso,
  },
} satisfies Meta<typeof SsoEnforcementModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enforce: Story = {};

/** More members than one page holds: the count is a lower bound. */
export const EnforcePartialCount: Story = { args: { membersOnVerifiedDomainsCount: 50, membersCountIsPartial: true } };

export const Lift: Story = { args: { enforced: false } };

/** Platform support acting for the workspace. */
export const BackOffice: Story = { args: { enforced: false, surface: 'back-office' } };
