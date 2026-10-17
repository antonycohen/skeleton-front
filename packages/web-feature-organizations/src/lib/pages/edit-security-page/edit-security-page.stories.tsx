import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MfaStatus } from '@skeleton/core-api-models';
import {
  daysAgo,
  mock,
  organizationMembersAsEditor,
  ssoDraftConnection,
  ssoSamlConnection,
  workspace,
  workspaceWithSso,
  type ScreenParameters,
} from '@skeleton/storybook-support';
import { SecurityRoutes } from '../../routes/security-routes';

const MEMBERS = '/organizations/:organizationId/members';
const SSO_CONNECTION = '/organizations/:organizationId/sso-connection';
const OWN_MFA = '/users/:userId/mfa';

const mfaStatus = (overrides: Partial<MfaStatus>): MfaStatus => ({
  enabled: false,
  enabledAt: null,
  recoveryCodesRemaining: 0,
  required: false,
  requiredBy: null,
  ...overrides,
});

/** The connected admin has two-factor authentication: every control is available. */
const ownMfaEnabled = mock.body(OWN_MFA, mfaStatus({ enabled: true, enabledAt: daysAgo(40), recoveryCodesRemaining: 8 }));

const meta = {
  title: 'Screens/Settings/Security',
  component: SecurityRoutes,
  parameters: {
    screen: { path: 'settings/security/*', url: 'settings/security' } satisfies ScreenParameters,
    msw: [ownMfaEnabled],
  },
} satisfies Meta<typeof SecurityRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Not entitled to single sign-on: the 2FA requirement and the SSO upsell. */
export const Default: Story = {};

/** Every member must use 2FA. */
export const MfaRequired: Story = { parameters: { workspace: { ...workspace, mfaRequired: true } } };

/** The admin has no 2FA of their own, so they cannot require it yet. */
export const OwnMfaMissing: Story = {
  parameters: { msw: [mock.body(OWN_MFA, mfaStatus({}))] },
};

/** Entitled, OIDC connection tested and enabled, one domain verified and one pending. */
export const SsoEnabled: Story = { parameters: { workspace: workspaceWithSso } };

/** Entitled, nothing configured yet (the API answers 404 for the connection). */
export const SsoNotConfigured: Story = {
  parameters: {
    workspace: { ...workspaceWithSso, ssoStatus: 'none' },
    msw: [ownMfaEnabled, mock.error(SSO_CONNECTION, 404), mock.empty('/organizations/:organizationId/sso-domains')],
  },
};

/** The connection is saved but has never been tested. */
export const SsoDraft: Story = {
  parameters: {
    workspace: { ...workspaceWithSso, ssoStatus: 'draft' },
    msw: [ownMfaEnabled, mock.body(SSO_CONNECTION, ssoDraftConnection)],
  },
};

/** SAML connection required for everyone, with its signing certificates (one expiring soon). */
export const SsoSamlEnforced: Story = {
  parameters: {
    workspace: { ...workspaceWithSso, ssoStatus: 'enforced', mfaRequired: true },
    msw: [ownMfaEnabled, mock.body(SSO_CONNECTION, ssoSamlConnection)],
  },
};

/** The connection could not be read (anything but a 404): said out loud above the cards. */
export const SsoLoadFailed: Story = {
  parameters: {
    workspace: workspaceWithSso,
    msw: [ownMfaEnabled, mock.error(SSO_CONNECTION, 500)],
  },
};

/** A member who is not an admin: read-only, single sign-on summarised. */
export const NotAdmin: Story = {
  parameters: { workspace: workspaceWithSso, msw: [ownMfaEnabled, mock.collection(MEMBERS, organizationMembersAsEditor)] },
};

export const Loading: Story = { parameters: { msw: [ownMfaEnabled, mock.loading(MEMBERS)] } };
