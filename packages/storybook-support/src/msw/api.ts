import { delay, http, HttpResponse, type HttpHandler } from 'msw';

/** The fake origin set in `.env.storybook`: every request to it is answered by the Mock Service Worker. */
export const API_ORIGIN: string = import.meta.env.VITE_API_URL;

/** `api('/users/:id')` → `https://api.storybook.local/api/v1/users/:id` (MSW path params allowed). */
export const api = (path: string) => `${API_ORIGIN}/api/v1${path}`;

const toSnakeKey = (key: string) =>
  key
    .split('.')
    .map((part) => part.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`))
    .join('.');

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;

/**
 * Fixtures are written in camelCase like the app's models; the wire format is snake_case (the API
 * client converts with axios-case-converter), so every mocked body goes through this first. Same
 * rule as `packages/core-api/src/lib/api-client/key-case.ts`.
 */
export function snakeKeys<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) return value.map((entry) => snakeKeys(entry)) as T;
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [toSnakeKey(key), snakeKeys(entry)])) as T;
  }
  return value as T;
}

/**
 * The API is cross-origin (as in production) and called with credentials, so mocked responses carry
 * the CORS headers the real one sends, including the pagination headers the client reads.
 */
const corsHeaders = () => ({
  'Access-Control-Allow-Origin': window.location.origin,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Expose-Headers': 'X-Total-Count, X-Limit, X-Offset',
});

/** A JSON response in wire format. */
export const json = (body: unknown, init?: ResponseInit) =>
  HttpResponse.json(snakeKeys(body) as never, {
    ...init,
    headers: { ...corsHeaders(), ...(init?.headers as Record<string, string> | undefined) },
  });

/**
 * A paginated collection. The API answers with the bare array and the pagination in headers
 * (`X-Total-Count`, `X-Limit`, `X-Offset`), which the client folds into `{ data, pagination }`.
 * Honours the request's `offset` / `limit`.
 */
export const collection = <T>(items: T[], request?: Request) => {
  const url = request ? new URL(request.url) : null;
  const offset = Number(url?.searchParams.get('offset') ?? 0);
  const limit = Number(url?.searchParams.get('limit') ?? (items.length || 10));
  return json(items.slice(offset, offset + limit), {
    headers: { 'X-Total-Count': String(items.length), 'X-Limit': String(limit), 'X-Offset': String(offset) },
  });
};

/** A problem body the app's `ApiError` understands. */
export const problem = (status: number, message = 'Something went wrong') =>
  json({ code: status, message, errors: [] }, { status });

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Story overrides: put them in `parameters.msw` — they take precedence over the default handlers. */
export const mock = {
  /** The request never answers: the page stays in its loading state. */
  loading: (path: string, method: Method = 'get'): HttpHandler =>
    http[method](api(path), async () => {
      await delay('infinite');
      return HttpResponse.json({});
    }),
  /** An empty collection. */
  empty: (path: string): HttpHandler => http.get(api(path), ({ request }) => collection([], request)),
  /** An error status (500 by default). */
  error: (path: string, status = 500, method: Method = 'get'): HttpHandler =>
    http[method](api(path), () => problem(status)),
  /** A fixed body (camelCase, converted to the wire format). */
  body: (path: string, body: unknown, method: Method = 'get'): HttpHandler => http[method](api(path), () => json(body)),
  /** A collection of the given items. */
  collection: <T>(path: string, items: T[]): HttpHandler =>
    http.get(api(path), ({ request }) => collection(items, request)),
};
