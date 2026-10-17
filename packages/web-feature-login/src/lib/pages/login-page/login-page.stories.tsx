import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoginPage } from './login-page';

/**
 * `/login` renders nothing: on mount it sends the browser (`document.location`) to the
 * authorization server, forwarding the query (`login_hint`…) as extra authorization parameters.
 * Rendering it would navigate the Storybook frame away, so the story only describes it.
 */
const meta = {
  title: 'Screens/Login/Login',
  component: LoginPage,
  parameters: { session: 'anonymous', layout: 'centered' },
  render: () => (
    <div className="max-w-md space-y-2 p-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Not rendered: redirects on mount</p>
      <p>
        <code>/login</code> has no UI. It sends the browser to the authorization server (OAuth2
        authorization code + PKCE), which shows the sign-in form, then comes back to{' '}
        <code>/login/callback</code>.
      </p>
    </div>
  ),
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RedirectsToAuthorizationServer: Story = {};
