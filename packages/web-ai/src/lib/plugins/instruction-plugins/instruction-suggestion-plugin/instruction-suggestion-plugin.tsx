'use client';

import type {InstructionPlugin} from '../types';
import {isValidSuggestionsPayload, parseSuggestionsPayload} from './parse-suggestions';
import {SuggestionsPayload} from "./types";

/**
 * Instruction plugin for handling suggestion instructions.
 *
 * Processes <assistant-instruction name="suggestions"> tags and renders
 * clickable suggestion chips in the input area.
 *
 * @example
 * AI sends:
 * ```
 * Here are some options:
 *
 * <assistant-instruction name="suggestions">
 * Tell me more
 * Show examples
 * Start over
 * </assistant-instruction>
 * ```
 *
 * Result: Renders suggestion chips above the input field
 */
export const instructionSuggestionPlugin: InstructionPlugin<SuggestionsPayload> = {
  id: 'instruction-suggestions',
  instructionType: 'suggestions',
  priority: 10,

  parsePayload: parseSuggestionsPayload,

  shouldActivate: (payload) => {
    return isValidSuggestionsPayload(payload);
  },

  extract: (payload) => {
    return payload;
  },
};
