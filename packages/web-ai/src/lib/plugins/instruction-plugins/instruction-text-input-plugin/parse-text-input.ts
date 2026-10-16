import { TextInputPayload } from './types';

/**
 * Parse text-input instruction from tag attributes.
 *
 * The text-input instruction uses attributes (not content between tags)
 * to define its configuration.
 *
 * @example
 * ```
 * <assistant-instruction name="text-input" label="Your page" placeholder="www.example.com" validators="url" prefix="https://"></assistant-instruction>
 * ```
 *
 * @param _content - Raw content between tags (typically empty for text-input)
 * @param attributes - Parsed attributes from the instruction tag
 * @returns TextInputPayload
 */
export function parseTextInputPayload(
  _content: string,
  attributes: Record<string, string>
): TextInputPayload {
  return {
    label: attributes['label'],
    placeholder: attributes['placeholder'],
    prefix: attributes['prefix'],
    validators: attributes['validators']
      ? attributes['validators']
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : undefined,
    format: attributes['format'],
  };
}

/**
 * Validate that a text-input payload is usable.
 */
export function isValidTextInputPayload(payload: TextInputPayload): boolean {
  return payload !== null && typeof payload === 'object';
}
