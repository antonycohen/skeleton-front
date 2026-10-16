/**
 * Parse HTML-like attribute string into a key-value record.
 *
 * @param attrString - Raw attribute string (e.g., ' label="Your page" placeholder="example"')
 * @returns Record of attribute name to value
 *
 * @example
 * parseAttributes(' label="Your page" validators="url"')
 * // => { label: 'Your page', validators: 'url' }
 */
export function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const pattern = /(\w[\w-]*)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(attrString)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}
