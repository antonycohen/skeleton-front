export type AccessTokenPayload = {
  sub?: string;
  aud?: string | string[];
  exp?: number;
  [claim: string]: unknown;
};

/** JWT segments are base64url without padding, which `atob` alone rejects (`-`, `_`, missing `=`). */
const decodeBase64Url = (input: string): string => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

/**
 * Decodes the payload of a JWT access token without verifying it (the API does that). Returns
 * `null` for anything that is not a well-formed JWT, so callers never throw on a corrupt cookie.
 */
export const decodeAccessToken = (
  token: string | null | undefined,
): AccessTokenPayload | null => {
  if (!token) {
    return null;
  }
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(payload));
    return parsed !== null && typeof parsed === 'object'
      ? (parsed as AccessTokenPayload)
      : null;
  } catch {
    return null;
  }
};

/**
 * Whether the token was issued to this app's OAuth client. Every app of the platform persists its auth
 * cookie on the registrable parent domain, each under its own name and with its own client id;
 * this check is what guarantees a token minted for the web app is never adopted by the back
 * office (and vice versa), whatever cookie it arrives in. Fails closed: no `aud`,
 * an undecodable token or an unconfigured client id all count as foreign. A token without a
 * subject is refused too: the session set-up keys on `sub`, so keeping such a token would leave
 * the session check permanently pending instead of failing.
 *
 * The authorization server sets `aud` to the client id — a string for the single-audience case,
 * an array otherwise; both are handled.
 */
export const isTokenForThisApp = (
  token: string | null | undefined,
  clientId: string | undefined = import.meta.env['VITE_OAUTH_CLIENT_ID'],
): boolean => {
  if (!clientId) {
    return false;
  }
  const payload = decodeAccessToken(token);
  if (!payload || typeof payload.sub !== 'string' || payload.sub.length === 0) {
    return false;
  }
  const { aud } = payload;
  if (Array.isArray(aud)) {
    return aud.includes(clientId);
  }
  return aud === clientId;
};
