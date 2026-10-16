import type { ReactNode } from 'react';
import type { ChatMessage } from '../../types/plugin';
import type { ParsedInstruction } from '../../instructions/instruction-types';

// ============================================================================
// Input Plugin Context
// ============================================================================

/**
 * Context provided to input plugins for interacting with the chat.
 */
export interface AiChatInputPluginContext {
  /** Write text to the input field */
  setInputValue: (value: string) => void;
  /** Send the current input value as a message */
  sendMessage: () => void;
  /** Send a specific message directly */
  sendMessageContent: (content: string) => void;
  /** Current messages in the chat */
  messages: ChatMessage[];
  /** Whether currently streaming a response */
  isStreaming: boolean;
  /** Instructions parsed from the last assistant message */
  instructions: ParsedInstruction[];
}

// ============================================================================
// Input Plugin Definition
// ============================================================================

/**
 * Plugin definition for rendering UI in the input area based on instructions.
 *
 * Input plugins check if they should activate based on the last message
 * and its parsed instructions, then render custom UI in the input area
 * (above the text input).
 *
 * @example
 * ```tsx
 * const suggestionsPlugin: AiChatInputPlugin = {
 *   id: 'suggestions',
 *   shouldActivate: (msg, messages, instructions) => {
 *     if (!msg || msg.isStreaming) return false;
 *     return instructions.some(i => i.type === 'suggestions');
 *   },
 *   render: (ctx) => {
 *     const suggestion = ctx.instructions.find(i => i.type === 'suggestions');
 *     return <SuggestionChips suggestions={suggestion.payload.suggestions} ctx={ctx} />;
 *   }
 * };
 * ```
 */
export interface AiChatInputPlugin {
  /** Unique plugin identifier */
  id: string;

  /** Priority for processing (higher = first). Default: 0 */
  priority?: number;

  /**
   * When true, the default textarea input is hidden when this plugin is active.
   * The plugin is expected to provide its own complete input UI.
   * Default: false (plugin renders above the textarea)
   */
  replaceDefaultInput?: boolean;

  /**
   * Check if this plugin should activate.
   * Called with the last assistant message (or undefined if none).
   *
   * @param lastMessage - The last assistant message, or undefined
   * @param messages - All messages in the chat
   * @param instructions - Parsed instructions from the last assistant message
   * @returns true if the plugin should activate
   */
  shouldActivate: (
    lastMessage: ChatMessage | undefined,
    messages: ChatMessage[],
    instructions: ParsedInstruction[]
  ) => boolean;

  /**
   * Render the plugin UI.
   * Instructions are available via ctx.instructions.
   *
   * @param ctx - Plugin context with actions, chat state, and instructions
   * @returns React node to render in the input area
   */
  render: (ctx: AiChatInputPluginContext) => ReactNode;
}

// ============================================================================
// Factory Helper
// ============================================================================

/**
 * Helper function to create a type-safe input plugin.
 */
export function createInputPlugin(plugin: AiChatInputPlugin): AiChatInputPlugin {
  return {
    priority: 0,
    ...plugin,
  };
}
