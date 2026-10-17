import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ScreenParameters } from '@skeleton/storybook-support';
import { OAUTH_CALLBACK_RETRY_FLAG, OauthCallbackPage } from './oauth-callback-page';

/**
 * `/login/callback` reads the authorization server's answer from `window.location.search`, not
 * from the router. Each story sets the frame's query with `history.replaceState` (no navigation)
 * and restores it afterwards. A `code` (the token exchange against the real OAuth server) is never
 * simulated.
 */
const withCallbackQuery =
  (query: Record<string, string>, { retrySpent = false } = {}) =>
  () => {
    const original = window.location.href;
    const url = new URL(original);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    window.history.replaceState(window.history.state, '', url);
    if (retrySpent) sessionStorage.setItem(OAUTH_CALLBACK_RETRY_FLAG, '1');
    // The page logs the refusal it handles on purpose; keep the console for real errors.
    const consoleError = console.error;
    console.error = (...args: unknown[]) => {
      if (args[0] !== 'OAuth authorization failed') consoleError(...args);
    };
    return () => {
      console.error = consoleError;
      sessionStorage.removeItem(OAUTH_CALLBACK_RETRY_FLAG);
      window.history.replaceState(window.history.state, '', original);
    };
  };

const meta = {
  title: 'Screens/Login/OAuth callback',
  component: OauthCallbackPage,
  parameters: {
    session: 'anonymous',
    screen: { path: '/login/callback', layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof OauthCallbackPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** While the code is exchanged for tokens. */
export const SigningIn: Story = {};

/** A refusal the authorization server settles (two-factor to set up), already retried once: ends here. */
export const MfaEnrolmentRequired: Story = {
  beforeEach: withCallbackQuery({ error: 'access_denied', error_description: 'mfa_enrolment_required' }, { retrySpent: true }),
};

export const SsoSessionExpired: Story = {
  beforeEach: withCallbackQuery({ error: 'access_denied', error_description: 'sso_session_expired' }, { retrySpent: true }),
};

/** First refusal: one more pass through `/login` (shown as the "Navigated away" placeholder). */
export const RetriesThroughLogin: Story = {
  beforeEach: withCallbackQuery({ error: 'access_denied', error_description: 'session_revoked' }),
};

/**
 * Single sign-on required while a session is still open in this tab: the retry carries its address
 * as `login_hint`, so the authorization server routes it to the identity provider directly.
 */
export const RetriesWithLoginHint: Story = {
  parameters: { session: 'connected' },
  beforeEach: withCallbackQuery({ error: 'access_denied', error_description: 'sso_required' }),
};

/** The account itself is refused: straight to the denied page. */
export const AccessDenied: Story = {
  beforeEach: withCallbackQuery({ error: 'access_denied', error_description: 'This account is not an administrator.' }),
};
