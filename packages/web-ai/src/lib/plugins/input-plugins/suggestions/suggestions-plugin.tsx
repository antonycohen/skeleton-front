'use client';

import type {AiChatInputPlugin, AiChatInputPluginContext} from '../types';
import {SuggestionChips} from './suggestion-chips';
import {SuggestionsPayload} from "../../instruction-plugins/instruction-suggestion-plugin/types";

/**
 * Input plugin for rendering suggestion items from <assistant-instruction> tags.
 *
 * When the AI sends a message containing:
 * <assistant-instruction name="suggestions" data-question="Your question?">
 * Option 1
 * Option 2
 * </assistant-instruction>
 *
 * This plugin:
 * 1. Detects the instruction in the last assistant message
 * 2. Renders a numbered suggestion list with the question as header
 * 3. Clicking a suggestion sends it as a message
 * 4. Includes a "Something else..." free text input at the bottom
 */
export const suggestionsInputPlugin: AiChatInputPlugin = {
  id: 'suggestions-input',
  priority: 10,
  replaceDefaultInput: true,

  shouldActivate(lastMessage, _messages, instructions) {
    if (!lastMessage || lastMessage.role !== 'assistant') return false;
    if (lastMessage.isStreaming) return false;

    return instructions.some((i) => i.type === 'suggestions');
  },

  render(ctx: AiChatInputPluginContext) {
    const suggestionInstruction = ctx.instructions.find(
      (i) => i.type === 'suggestions'
    );

    if (!suggestionInstruction) return null;

    const payload = suggestionInstruction.payload as SuggestionsPayload;
    if (!payload.suggestions || payload.suggestions.length === 0) return null;

    return (
      <SuggestionChips
        suggestions={payload.suggestions}
        question={payload.question}
        ctx={ctx}
      />
    );
  },
};
