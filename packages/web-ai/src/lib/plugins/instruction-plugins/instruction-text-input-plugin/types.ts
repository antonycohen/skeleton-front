export interface TextInputPayload {
  label?: string;
  placeholder?: string;
  validators?: string[];
  prefix?: string;
  /** Optional format string. Use %s as placeholder for the value. */
  format?: string;
}
