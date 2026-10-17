import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { User } from '@skeleton/core-api-models';
import { mock, users, type ScreenParameters } from '@skeleton/storybook-support';
import { UserDetailManagerPage } from './details-user-manager-page';

const [, withMfa, , pending, withoutMfa, invited] = users;
const screen = (user: User): ScreenParameters => ({
  path: '/users/:userId',
  url: `/users/${user.id}`,
  layout: 'bare',
  workspace: false,
});

const meta = {
  title: 'Screens/Back office/Users/Details',
  component: UserDetailManagerPage,
  parameters: {
    screen: { path: '/users/:userId', url: `/users/${withMfa.id}`, layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof UserDetailManagerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two-factor on, preferences set. */
export const Default: Story = {};

/** No second factor: "Reset 2FA" is disabled; no preferences saved yet. */
export const WithoutMfa: Story = { parameters: { screen: screen(withoutMfa) } };

/** Signed up, email not confirmed. */
export const Pending: Story = { parameters: { screen: screen(pending) } };

/** Invited to a workspace, account not created yet. */
export const Invited: Story = { parameters: { screen: screen(invited) } };

/** The reset confirmation, for a user who lost their authenticator and recovery codes. */
export const ResetMfa: Story = {
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button', { name: 'Reset 2FA' });
    await userEvent.click(button);
    await expect(await within(document.body).findByRole('dialog')).toBeInTheDocument();
  },
};

export const Loading: Story = { parameters: { msw: [mock.loading('/users/:userId')] } };

export const NotFound: Story = { parameters: { msw: [mock.error('/users/:userId', 404)] } };
