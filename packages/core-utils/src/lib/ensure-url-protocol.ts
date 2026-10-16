/**
 * Prepend `https://` to a URL string if it has no protocol.
 * Returns the string unchanged if it already starts with `http://` or `https://`,
 * or if it is empty / whitespace-only.
 */
export function ensureUrlProtocol(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
