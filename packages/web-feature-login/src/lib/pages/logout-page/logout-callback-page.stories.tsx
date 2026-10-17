import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ScreenParameters } from '@skeleton/storybook-support';
import { LogoutPage as LogoutCallbackPage } from './logout-callback-page';

/** Back from the API's logout: clears the tokens and the session, then goes to `/login`. */
const meta = {
  title: 'Screens/Login/Logout callback',
  component: LogoutCallbackPage,
  parameters: {
    screen: { path: '/logout/callback', layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof LogoutCallbackPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Renders nothing and navigates to `/login` (shown as the "Navigated away" placeholder). */
export const ClearsSessionAndRedirects: Story = {};
