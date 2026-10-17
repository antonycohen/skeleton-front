import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignupPage } from './signup-page';

/**
 * Same as `/login` with `register=1`: on mount it sends the browser (`document.location`) to the
 * authorization server's sign-up form. Rendering it would navigate the Storybook frame away, so the
 * story only describes it.
 */
const meta = {
  title: 'Screens/Login/Signup',
  component: SignupPage,
  parameters: { session: 'anonymous', layout: 'centered' },
  render: () => (
    <div className="max-w-md space-y-2 p-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Not rendered: redirects on mount</p>
      <p>
        <code>/signup</code> has no UI. It sends the browser to the authorization server&apos;s
        sign-up form (<code>register=1</code>), which comes back to <code>/login/callback</code>.
      </p>
    </div>
  ),
} satisfies Meta<typeof SignupPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RedirectsToAuthorizationServer: Story = {};
