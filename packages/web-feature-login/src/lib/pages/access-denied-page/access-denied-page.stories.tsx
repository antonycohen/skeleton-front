import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ScreenParameters } from '@skeleton/storybook-support';
import { AccessDeniedPage } from './access-denied-page';

/** Terminal page of a refused login; the description comes from the query. */
const at = (search = ''): ScreenParameters => ({
  path: '/login/denied',
  url: `/login/denied${search}`,
  layout: 'bare',
  workspace: false,
});

const meta = {
  title: 'Screens/Login/Access denied',
  component: AccessDeniedPage,
  parameters: {
    session: 'anonymous',
    screen: {
      path: '/login/denied',
      url: '/login/denied?error=access_denied',
      layout: 'bare',
      workspace: false,
    } satisfies ScreenParameters,
  },
} satisfies Meta<typeof AccessDeniedPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The account has no access to this application (e.g. the back office). */
export const Default: Story = {};

/** The authorization server's own wording. */
export const ServerDescription: Story = {
  parameters: {
    screen: at('?error=access_denied&error_description=This+account+is+not+an+administrator.'),
  },
};

/** A token was issued but the user could not be loaded for this app. */
export const SessionUnavailable: Story = { parameters: { screen: at('?error=session_unavailable') } };

/** A refusal the authorization server settles (here: two-factor to set up), said in words. */
export const MfaEnrolmentRequired: Story = {
  parameters: { screen: at('?error=access_denied&error_description=mfa_enrolment_required') },
};
