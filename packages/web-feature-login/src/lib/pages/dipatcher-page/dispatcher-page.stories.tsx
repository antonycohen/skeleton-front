import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApiError } from '@skeleton/core-api';
import { useOAuthStore } from '@skeleton/core-store-oauth';
import { useSessionStore } from '@skeleton/core-store-session';
import { WORKSPACE_ID, type ScreenParameters } from '@skeleton/storybook-support';
import { DispatcherPage } from './dispatcher-page';

/**
 * `/login/dispatcher`, after the code exchange: waits for the session, then sends the user to the
 * address they first asked for (`target-url`), home, the login, or the denied page. Each redirect
 * shows as the "Navigated away" placeholder with its target.
 */
const meta = {
  title: 'Screens/Login/Dispatcher',
  component: DispatcherPage,
  parameters: {
    screen: { path: '/login/dispatcher', layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof DispatcherPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed in, nothing stored: home. */
export const SignedIn: Story = {};

/** Signed in after being bounced from a protected page: back to it. */
export const ToTargetUrl: Story = {
  beforeEach: () => {
    localStorage.setItem('target-url', `/w/${WORKSPACE_ID}/assistant`);
    return () => localStorage.removeItem('target-url');
  },
};

/** A token but no user yet: waits on the session. */
export const WaitingForSession: Story = {
  parameters: { session: 'anonymous' },
  beforeEach: () => {
    useOAuthStore.getState().setAuth({ accessToken: 'storybook-pending', refreshToken: null, accessTokenExpirationDate: null });
    return () => useOAuthStore.getState().reset();
  },
};

/** Neither token nor user: back to the login. */
export const Anonymous: Story = { parameters: { session: 'anonymous' } };

/** The user could not be loaded for this app: denied page instead of an SSO loop. */
export const SessionError: Story = {
  parameters: { session: 'anonymous' },
  beforeEach: () => {
    useOAuthStore.getState().setAuth({ accessToken: 'storybook-pending', refreshToken: null, accessTokenExpirationDate: null });
    useSessionStore.getState().setError(
      new ApiError({ error: 'Forbidden', httpCode: 403, statusCode: 403, errorCode: 403, parametersErrors: {} }),
    );
    return () => {
      useOAuthStore.getState().reset();
      useSessionStore.getState().setError(null);
    };
  },
};
