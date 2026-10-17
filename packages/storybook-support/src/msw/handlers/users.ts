import { http, HttpResponse, type HttpHandler } from 'msw';
import { api, collection, json, problem } from '../api';
import { mfaEnrolment, mfaRecoveryCodes, mfaStatuses, users } from '../../fixtures/users';

/** A write the API answers without a body (`void` endpoints). */
const noContent = () =>
  new HttpResponse(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': window.location.origin, 'Access-Control-Allow-Credentials': 'true' },
  });

const toCamelKey = (key: string) => key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());

/** The body arrives in wire format (snake_case); fixtures are camelCase. */
const camelKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(camelKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [toCamelKey(key), camelKeys(entry)]));
  }
  return value;
};

/** Default handlers for the users domain (fixtures in ../../fixtures/users.ts). */
export const usersHandlers: HttpHandler[] = [
  http.get(api('/users'), ({ request }) => {
    const term = new URL(request.url).searchParams.get('term')?.toLowerCase();
    const matching = term
      ? users.filter((u) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(term))
      : users;
    return collection(matching, request);
  }),

  // --- Two-factor authentication. Users with `mfaEnabled` have it on; story overrides pick another of `mfaStatuses`.
  http.get(api('/users/:userId/mfa'), ({ params }) =>
    json(users.find((u) => u.id === params['userId'])?.mfaEnabled ? mfaStatuses.enabled : mfaStatuses.disabled),
  ),
  http.post(api('/users/:userId/mfa/totp'), () => json(mfaEnrolment)),
  http.post(api('/users/:userId/mfa/totp/activate'), () => json(mfaRecoveryCodes)),
  http.post(api('/users/:userId/mfa/recovery-codes'), () => json(mfaRecoveryCodes)),
  http.post(api('/users/:userId/mfa/disable'), () => noContent()),
  // Back office: clears someone else's second factor.
  http.post(api('/users/:userId/mfa/reset'), () => noContent()),

  // --- Account settings.
  http.post(api('/users/:userId/change-email-request'), () => noContent()),
  http.post(api('/users/:userId/change-password-request'), () => noContent()),

  // The connected user is answered by the session handlers; these are the others.
  http.get(api('/users/:userId'), ({ params }) => {
    const user = users.find((u) => u.id === params['userId']);
    return user ? json(user) : problem(404, 'User not found');
  }),
  // The update is echoed onto the stored user (not kept: the next read returns the fixture again).
  http.patch(api('/users/:userId'), async ({ params, request }) => {
    const user = users.find((u) => u.id === params['userId']);
    if (!user) return problem(404, 'User not found');
    const updates = camelKeys(await request.json().catch(() => ({}))) as Partial<typeof user>;
    return json({ ...user, ...updates });
  }),
  http.delete(api('/users/:userId'), () => noContent()),
];
