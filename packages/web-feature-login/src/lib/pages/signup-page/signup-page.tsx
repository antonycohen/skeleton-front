import { authorizationExtraParams, useAuthorizationRedirect } from '../shared';

/**
 * Same passthrough as /login; `register` is what makes this entry point a sign-up, so it wins
 * over anything the query carries.
 */
const signupExtraParams = (search: string) => ({
  ...authorizationExtraParams(search),
  register: '1',
});

export function SignupPage() {
  useAuthorizationRedirect(signupExtraParams);

  return null;
}

export default SignupPage;
