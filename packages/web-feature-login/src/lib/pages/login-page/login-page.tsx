import { authorizationExtraParams, useAuthorizationRedirect } from '../shared';

export function LoginPage() {
  useAuthorizationRedirect(authorizationExtraParams);

  return null;
}

export default LoginPage;
