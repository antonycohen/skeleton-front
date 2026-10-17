import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogoutPage } from './logout-page';

/**
 * `/logout` renders nothing: on mount it sets `document.location` to the API's `/logout`, which
 * ends the authorization server's session and comes back to `/logout/callback`. Rendering it would
 * navigate the Storybook frame away, so the story only describes it.
 */
const meta = {
  title: 'Screens/Login/Logout',
  component: LogoutPage,
  parameters: { layout: 'centered' },
  render: () => (
    <div className="max-w-md space-y-2 p-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Not rendered: redirects on mount</p>
      <p>
        <code>/logout</code> has no UI. It sends the browser to the API&apos;s <code>/logout</code>{' '}
        (server session ended), then to <code>/logout/callback</code>, which clears the local session.
      </p>
    </div>
  ),
} satisfies Meta<typeof LogoutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RedirectsToApi: Story = {};
