import { http, HttpResponse } from 'msw';
import { API_ORIGIN, collection, json } from '../api';

const ID_SEGMENT = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-z]+_[A-Za-z0-9]+|\d+)$/i;

const note = (request: Request) =>
  console.info(`[storybook-msw] no handler for ${request.method} ${new URL(request.url).pathname}, answered by the fallback`);

/**
 * Registered last: any API call no domain handler answers still gets a plausible, empty answer, so a
 * screen never hangs on a request nobody mocked. A path ending with an id gets `{ id }`, anything
 * else an empty collection; writes echo their body. The console says which calls fell through, so
 * the gap can be closed with a real handler.
 */
export const fallbackHandlers = [
  http.get(`${API_ORIGIN}/*`, ({ request }) => {
    note(request);
    const last = new URL(request.url).pathname.split('/').filter(Boolean).pop() ?? '';
    return ID_SEGMENT.test(last) ? json({ id: last }) : collection([], request);
  }),
  http.all(`${API_ORIGIN}/*`, async ({ request }) => {
    note(request);
    if (request.method === 'DELETE') return new HttpResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': window.location.origin, 'Access-Control-Allow-Credentials': 'true' } });
    const body = await request.json().catch(() => ({}));
    // The body arrives in wire format already; json() would only re-snake it, which is harmless.
    return json({ id: crypto.randomUUID(), ...(body as object) });
  }),
];
