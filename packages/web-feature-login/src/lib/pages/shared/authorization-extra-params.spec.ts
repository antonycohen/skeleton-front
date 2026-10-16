import { describe, expect, it } from 'vitest';
import { authorizationExtraParams } from './authorization-extra-params';

describe('authorizationExtraParams', () => {
  it('forwards application parameters', () => {
    expect(authorizationExtraParams('?register=1&login_hint=jane%40example.com')).toEqual({
      register: '1',
      login_hint: 'jane@example.com',
    });
  });

  it('drops the parameters the authorization request owns', () => {
    expect(
      authorizationExtraParams(
        '?error=access_denied&error_description=denied&error_uri=x&code=c&state=s&client_id=id' +
          '&redirect_uri=r&response_type=code&scope=openid&code_challenge=cc&code_challenge_method=S256&register=1',
      ),
    ).toEqual({ register: '1' });
  });

  it('returns undefined when nothing is left to forward', () => {
    expect(authorizationExtraParams('')).toBeUndefined();
    expect(authorizationExtraParams('?error=access_denied')).toBeUndefined();
  });
});
