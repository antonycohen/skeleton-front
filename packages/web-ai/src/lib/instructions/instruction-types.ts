/**
 * Parsed instruction from message content.
 * Instructions are extracted from <assistant-instruction> tags.
 */
export interface ParsedInstruction<T = unknown> {
  /** Instruction type from the name attribute */
  type: string;
  /** Raw content between tags */
  content: string;
  /** Parsed payload (type-specific) */
  payload: T;
  /** Attributes from the instruction tag (excluding name) */
  attributes: Record<string, string>;
}

// ============================================================================
// Built-in Instruction Payloads
// ============================================================================




