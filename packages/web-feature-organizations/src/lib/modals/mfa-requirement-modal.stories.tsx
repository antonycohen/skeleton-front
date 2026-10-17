import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { WORKSPACE_ID, type ScreenParameters } from '@skeleton/storybook-support';
import { MfaRequirementModal } from './mfa-requirement-modal';

/** Confirms requiring (or lifting) two-factor authentication for every member. */
const meta = {
  title: 'Screens/Settings/Modals/MFA requirement',
  component: MfaRequirementModal,
  args: {
    open: true,
    onOpenChange: fn(),
    organizationId: WORKSPACE_ID,
    required: true,
    membersWithoutMfaCount: 3,
    membersCountIsPartial: false,
  },
  parameters: {
    screen: { path: 'settings/security' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof MfaRequirementModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Require: Story = {};

/** Every active member already has a second factor. */
export const RequireAllCovered: Story = { args: { membersWithoutMfaCount: 0 } };

/** Counted by someone the API does not show the coverage to (not an admin). */
export const RequireCountUnknown: Story = { args: { membersWithoutMfaCount: null } };

export const Lift: Story = { args: { required: false } };
