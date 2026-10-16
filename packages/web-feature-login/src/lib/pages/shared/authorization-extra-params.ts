/**
 * Query parameters the authorization request owns. `/login` forwards whatever query it was opened
 * with to the authorization server, and a duplicate of one of these is an `invalid_request` there
 * (the OAuth client refuses to overwrite them, too). They typically arrive as leftovers of a failed
 * callback (`error`, `error_description`) that got redirected back to `/login`.
 */
const RESERVED_AUTHORIZATION_PARAMS = new Set([
  'error',
  'error_description',
  'error_uri',
  'code',
  'state',
  'client_id',
  'redirect_uri',
  'response_type',
  'scope',
  'code_challenge',
  'code_challenge_method',
]);

/** The extra authorization parameters to forward from a `/login` query string, or `undefined` when there are none. */
export const authorizationExtraParams = (
  search: string,
): Record<string, string> | undefined => {
  const extraParams: Record<string, string> = {};
  new URLSearchParams(search).forEach((value, key) => {
    if (!RESERVED_AUTHORIZATION_PARAMS.has(key)) {
      extraParams[key] = value;
    }
  });

  return Object.keys(extraParams).length > 0 ? extraParams : undefined;
};
