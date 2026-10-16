// Types
export type {
  ParsedInstruction,
} from './instruction-types';

// Utilities
export { parseAttributes } from './parse-attributes';
export { extractInstructionBlocks } from './extract-instructions';
export type { RawInstructionBlock } from './extract-instructions';

export const INSTRUCTION_PATTERN =
  /<assistant-instruction\s+name="([^"]+)"([^>]*?)>([\s\S]*?)<\/assistant-instruction>/g;
