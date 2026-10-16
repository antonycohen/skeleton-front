/**
 * The refusals the authorization server answers a token request with that the portal can resolve on
 * the next pass: none of them is a refused account, so none ends on the denied page. `access_denied`
 * carries them as its `error_description`. Each one maps to the translation key of its wording.
 *
 * - `mfa_enrolment_required`: the account has no second factor and the workspace requires one; the
 *   portal makes the person set it up.
 * - `sso_required`: the address is under an enforced connection and this session did not come
 *   through it; the portal routes the address to its identity provider.
 * - `sso_session_expired`: the session came through a connection, older than that connection allows.
 * - `session_revoked`: access was ended (a member removed or suspended, a password changed), so
 *   every session older than that moment is refused. A fresh sign-in is one.
 */
export const SIGN_IN_REFUSALS = {
  mfa_enrolment_required: { i18nKey: 'login.refusal.mfaEnrolmentRequired' },
  sso_required: { i18nKey: 'login.refusal.ssoRequired' },
  sso_session_expired: { i18nKey: 'login.refusal.ssoSessionExpired' },
  session_revoked: { i18nKey: 'login.refusal.sessionRevoked' },
} as const;

export type SignInRefusal = keyof typeof SIGN_IN_REFUSALS;

/** The refusals for which the portal can route the address straight to its identity provider. */
const SSO_REFUSALS: ReadonlySet<SignInRefusal> = new Set<SignInRefusal>([
  'sso_required',
  'sso_session_expired',
]);

export const isSsoRefusal = (refusal: SignInRefusal | null): boolean =>
  !!refusal && SSO_REFUSALS.has(refusal);

/** The refusal a string names, or `null` for anything else (a real `access_denied`, say). */
export const asSignInRefusal = (value: unknown): SignInRefusal | null =>
  typeof value === 'string' && Object.hasOwn(SIGN_IN_REFUSALS, value)
    ? (value as SignInRefusal)
    : null;

/**
 * The refusal a failed code exchange states. The parsed body is the reliable place; the message is
 * read too because the OAuth client folds the description into it.
 */
export const signInRefusalFromError = (error: unknown): SignInRefusal | null => {
  if (!(error instanceof Error)) return null;
  const body = (error as { parsedBody?: { error_description?: unknown } }).parsedBody;
  const fromBody = asSignInRefusal(body?.error_description);
  if (fromBody) return fromBody;

  return (
    (Object.keys(SIGN_IN_REFUSALS) as SignInRefusal[]).find((refusal) =>
      error.message.includes(refusal),
    ) ?? null
  );
};
