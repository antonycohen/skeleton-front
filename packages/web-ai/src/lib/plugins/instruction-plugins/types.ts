import type {ChatMessage} from '../../types/plugin';
import type {ParsedInstruction} from '../../instructions';

// ============================================================================
// Instruction Plugin Context
// ============================================================================

/**
 * Context provided to instruction plugins for interacting with the chat.
 */
export interface InstructionPluginContext {
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
}

// ============================================================================
// Instruction Plugin Definition
// ============================================================================

/**
 * Plugin definition for handling specific instruction types.
 *
 * Instruction plugins process <assistant-instruction name="..."> tags
 * and parse their content into typed payloads stored in the instruction store.
 *
 * The core responsibility is `parsePayload` - converting raw instruction content
 * into a typed payload. The optional `shouldActivate` and `extract` methods can
 * be used by input plugins or other consumers for additional validation/transformation.
 *
 * @template T - The payload type this plugin handles
 *
 * @example
 * ```tsx
 * const suggestionsPlugin: InstructionPlugin<SuggestionsPayload> = {
 *   id: 'instruction-suggestions',
 *   instructionType: 'suggestions',
 *   parsePayload: (content) => ({ suggestions: content.split('\n').filter(Boolean) }),
 *   shouldActivate: (payload) => payload.suggestions.length > 0,
 * };
 * ```
 */
export interface InstructionPlugin<T = unknown> {
  /** Unique plugin identifier */
  id: string;

  /** Instruction type this plugin handles (matches name attribute) */
  instructionType: string;

  /** Priority for processing (higher = first). Default: 0 */
  priority?: number;

  /**
   * Parse the raw instruction content into a typed payload.
   * This is the core method - called during instruction extraction.
   *
   * @param content - Raw content between instruction tags
   * @param attributes - Parsed attributes from the instruction tag (excluding name)
   * @returns Parsed payload object
   */
  parsePayload: (content: string, attributes: Record<string, string>) => T;

  /**
   * Optional: Check if this plugin should activate based on the payload.
   * Can be used by input plugins to determine if they should render UI.
   *
   * @param payload - Parsed instruction payload
   * @param instruction - Full parsed instruction
   * @param messages - All messages in the chat
   * @returns true if the plugin should activate
   */
  shouldActivate?: (
    payload: T,
    instruction: ParsedInstruction<T>,
    messages: ChatMessage[]
  ) => boolean;

  /**
   * Optional: Extract/transform data from the instruction for external use.
   *
   * @param payload - Parsed instruction payload
   * @param instruction - Full parsed instruction
   * @returns Transformed data for use by other components
   */
  extract?: (payload: T, instruction: ParsedInstruction<T>) => T;
}

// ============================================================================
// Factory Helper
// ============================================================================

/**
 * Helper function to create a type-safe instruction plugin.
 */
export function createInstructionPlugin<T>(
  plugin: InstructionPlugin<T>
): InstructionPlugin<T> {
  return {
    priority: 0,
    ...plugin,
  };
}
