/**
 * Key case conversion shared by the HTTP client (axios case middleware) and the code that reads
 * backend JSON outside of it (a payload embedded in a published outreach demo, for instance).
 * Deliberately regex-based rather than `change-case`: only `_x` / `-x` sequences are touched, so
 * record keys such as `1200x800` (e.g. image sizes) survive untouched.
 */
export const toCamelKey = (key: string): string =>
  key
    .split('.')
    .map((part) => part.replace(/[_-]./g, (match) => match.charAt(1).toUpperCase()))
    .join('.');

export const toSnakeKey = (key: string): string =>
  key
    .split('.')
    .map((part) => part.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`))
    .join('.');

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date) &&
  Object.getPrototypeOf(value) === Object.prototype;

/** Deeply re-keys plain objects with `toCamelKey`; arrays are mapped, everything else is returned as is. */
export function camelizeKeys<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((entry) => camelizeKeys(entry)) as T;
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      result[toCamelKey(key)] = camelizeKeys(entry);
    }
    return result as T;
  }
  return value as T;
}
