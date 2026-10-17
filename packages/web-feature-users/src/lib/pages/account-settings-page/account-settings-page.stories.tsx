import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { mfaStatuses, mock, WORKSPACE_ID, type ScreenParameters } from '@skeleton/storybook-support';
import { AccountRoutes } from '../../routes/account-routes';

/**
 * The tabs are child routes of the page, so the story mounts the package's routes and opens
 * each tab by its address.
 */
const meta = {
  title: 'Screens/Account/Settings',
  component: AccountRoutes,
  args: { baseUrl: `/w/${WORKSPACE_ID}` },
  parameters: {
    screen: { path: 'account/*', url: 'account/profile' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof AccountRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Profile: Story = {};

export const Connexion: Story = {
  parameters: { screen: { path: 'account/*', url: 'account/connexion' } },
};

export const Preferences: Story = {
  parameters: { screen: { path: 'account/*', url: 'account/preferences' } },
};

/** Also mounted under the workspace settings, which gives it the settings shell. */
export const InSettings: Story = {
  args: { baseUrl: `/w/${WORKSPACE_ID}/settings` },
  parameters: { screen: { path: 'settings/account/*', url: 'settings/account/profile' } },
};

const connexion = { path: 'account/*', url: 'account/connexion' } satisfies ScreenParameters;

/** "Set up" starts the enrolment: the dialog shows the QR code and the key to type in by hand. */
export const ConnexionSetUpMfa: Story = {
  parameters: { screen: connexion },
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button', { name: 'Set up' });
    // Disabled until the second factor's status has loaded.
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    await expect(await within(document.body).findByRole('dialog')).toBeInTheDocument();
  },
};

/** Two-factor on, with all its recovery codes. */
export const ConnexionMfaEnabled: Story = {
  parameters: { screen: connexion, msw: [mock.body('/users/:userId/mfa', mfaStatuses.enabled)] },
};

/** Two recovery codes left: a warning asks to regenerate them. */
export const ConnexionLowRecoveryCodes: Story = {
  parameters: { screen: connexion, msw: [mock.body('/users/:userId/mfa', mfaStatuses.lowRecoveryCodes)] },
};

/** Every recovery code used: the warning turns destructive. */
export const ConnexionNoRecoveryCodes: Story = {
  parameters: { screen: connexion, msw: [mock.body('/users/:userId/mfa', mfaStatuses.noRecoveryCodes)] },
};

/** A workspace requires two-factor and it is not set up yet. */
export const ConnexionMfaRequired: Story = {
  parameters: { screen: connexion, msw: [mock.body('/users/:userId/mfa', mfaStatuses.required)] },
};

/** Required (super admin) and on: it cannot be disabled. */
export const ConnexionMfaRequiredEnabled: Story = {
  parameters: { screen: connexion, msw: [mock.body('/users/:userId/mfa', mfaStatuses.requiredEnabled)] },
};
