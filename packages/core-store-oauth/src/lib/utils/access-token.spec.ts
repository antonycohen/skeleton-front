import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeAccessToken, isTokenForThisApp } from './access-token';

/** Unsigned JWT with the given payload, base64url-encoded without padding like a real one. */
const jwt = (payload: Record<string, unknown>): string => {
  const encode = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode('{"alg":"RS256"}')}.${encode(JSON.stringify(payload))}.signature`;
};

describe('decodeAccessToken', () => {
  it('returns the payload claims', () => {
    expect(decodeAccessToken(jwt({ sub: 'user-1', aud: 'oidc-client-public' }))).toEqual({
      sub: 'user-1',
      aud: 'oidc-client-public',
    });
  });

  it('decodes base64url payloads that plain atob rejects', () => {
    // '>>>???' encodes to "Pj4+Pz8/" in base64, so its base64url form carries both '-' and '_'.
    const token = jwt({ sub: '>>>???', aud: 'x' });
    expect(token.split('.')[1]).toMatch(/[-_]/);
    expect(() => atob(token.split('.')[1])).toThrow();

    expect(decodeAccessToken(token)?.sub).toBe('>>>???');
  });

  it('decodes non-ASCII claims', () => {
    const token = `h.${btoa(String.fromCharCode(...new TextEncoder().encode('{"sub":"élodie"}')))}.s`;
    expect(decodeAccessToken(token)?.sub).toBe('élodie');
  });

  it('returns null instead of throwing on anything that is not a JWT', () => {
    expect(decodeAccessToken(null)).toBeNull();
    expect(decodeAccessToken(undefined)).toBeNull();
    expect(decodeAccessToken('')).toBeNull();
    expect(decodeAccessToken('not-a-jwt')).toBeNull();
    expect(decodeAccessToken('a.!!!.c')).toBeNull();
    expect(decodeAccessToken(`a.${btoa('not json')}.c`)).toBeNull();
    expect(decodeAccessToken(`a.${btoa('"a string"')}.c`)).toBeNull();
  });
});

describe('isTokenForThisApp', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const own = (aud: string | string[]) => jwt({ sub: 'user-1', aud });

  it('accepts a token whose single audience is the client id', () => {
    expect(isTokenForThisApp(own('oidc-client-backoffice'), 'oidc-client-backoffice')).toBe(true);
  });

  it('accepts a token whose audience list contains the client id', () => {
    expect(isTokenForThisApp(own(['other', 'oidc-client-backoffice']), 'oidc-client-backoffice')).toBe(true);
  });

  it('rejects a token issued to another client', () => {
    expect(isTokenForThisApp(own('oidc-client-public'), 'oidc-client-backoffice')).toBe(false);
    expect(isTokenForThisApp(own(['oidc-client-public']), 'oidc-client-backoffice')).toBe(false);
  });

  it('rejects a token without a subject, which the session set-up could never resolve', () => {
    expect(isTokenForThisApp(jwt({ aud: 'oidc-client-backoffice' }), 'oidc-client-backoffice')).toBe(false);
    expect(isTokenForThisApp(jwt({ sub: '', aud: 'oidc-client-backoffice' }), 'oidc-client-backoffice')).toBe(false);
    expect(isTokenForThisApp(jwt({ sub: 42, aud: 'oidc-client-backoffice' }), 'oidc-client-backoffice')).toBe(false);
  });

  it('fails closed without an audience, without a token or without a configured client id', () => {
    expect(isTokenForThisApp(jwt({ sub: 'user-1' }), 'oidc-client-backoffice')).toBe(false);
    expect(isTokenForThisApp('garbage', 'oidc-client-backoffice')).toBe(false);
    expect(isTokenForThisApp(null, 'oidc-client-backoffice')).toBe(false);
    expect(isTokenForThisApp(own('oidc-client-backoffice'), undefined)).toBe(false);
    expect(isTokenForThisApp(own('oidc-client-backoffice'), '')).toBe(false);
  });

  it('defaults the client id to VITE_OAUTH_CLIENT_ID', () => {
    vi.stubEnv('VITE_OAUTH_CLIENT_ID', 'oidc-client-backoffice');

    expect(isTokenForThisApp(own('oidc-client-backoffice'))).toBe(true);
    expect(isTokenForThisApp(own('oidc-client-public'))).toBe(false);
  });
});
