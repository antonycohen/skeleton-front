import {SuggestionsPayload} from "./types";

/** A line that is (or starts with) an HTML-like tag — a leaked `</thinking>` or a repeated opening tag. */
const TAG_LINE = /^<\/?[a-z][\w-]*(\s|>|$)/i;

/**
 * Parse raw suggestion content into a typed payload.
 *
 * Content format: One suggestion per line.
 *
 * @example
 * ```
 * <assistant-instruction name="suggestions">
 * Tell me more about this topic
 * Show me an example
 * Start over
 * </assistant-instruction>
 * ```
 *
 * @param content - Raw content between instruction tags
 * @returns Parsed suggestions payload
 */
export function parseSuggestionsPayload(
  content: string,
  attributes: Record<string, string> = {}
): SuggestionsPayload {
  const suggestions = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    // Defensive: a tag is never an option, whatever the extractor let through
    .filter((line) => !TAG_LINE.test(line));

  return {
    suggestions,
    question: attributes['data-question'] || undefined,
  };
}

/**
 * Validate that a suggestions payload is valid and usable.
 *
 * @param payload - Parsed suggestions payload
 * @returns true if the payload has at least one suggestion
 */
export function isValidSuggestionsPayload(payload: SuggestionsPayload): boolean {
  return (
    payload !== null &&
    typeof payload === 'object' &&
    Array.isArray(payload.suggestions) &&
    payload.suggestions.length > 0
  );
}
