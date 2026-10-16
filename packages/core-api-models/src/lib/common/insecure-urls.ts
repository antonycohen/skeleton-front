/**
 * Plain-HTTP addresses where the web app otherwise requires https: accepted only by a DEV server
 * started with `VITE_ALLOW_INSECURE_URLS=true` (a local stack, the isolated e2e stack) — never by a
 * production build, whatever its environment says (`import.meta.env.DEV` is false there).
 *
 * Relaxed means: an `https://`-only field also takes `http://`, and where the app adds a scheme to a
 * bare host it still adds `https://` but keeps an `http://` the user typed. Messages may keep saying
 * "https", which is what a user anywhere else must enter.
 *
 * The backend decides on its own whether it follows (for SSO: `app.sso.oidc.allow-insecure-endpoints`).
 */
export const ALLOWS_INSECURE_URLS =
  import.meta.env['DEV'] === true && import.meta.env['VITE_ALLOW_INSECURE_URLS'] === 'true';

/** The scheme an "https only" address must start with, as a regular-expression fragment. */
export const SECURE_URL_SCHEME = ALLOWS_INSECURE_URLS ? 'https?' : 'https';

const EXPLICIT_HTTP = /^http:\/\//i;

/**
 * Put `prefix` (e.g. `https://`, shown before an input) in front of what the user typed. With
 * {@link ALLOWS_INSECURE_URLS}, an explicit `http://` the user typed is kept instead of becoming
 * `https://http://…`.
 */
export const withUrlPrefix = (prefix: string, value: string): string => {
  if (ALLOWS_INSECURE_URLS && /^https:\/\/$/i.test(prefix) && EXPLICIT_HTTP.test(value)) {
    return value;
  }
  return `${prefix}${value}`;
};
