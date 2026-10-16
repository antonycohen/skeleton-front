import { instructionSuggestionPlugin } from './instruction-suggestion-plugin';
import { instructionTextInputPlugin } from './instruction-text-input-plugin';

// Types
export type { InstructionPlugin, InstructionPluginContext } from './types';
export { createInstructionPlugin } from './types';

// Suggestion Plugin
export {
  instructionSuggestionPlugin,
  parseSuggestionsPayload,
  isValidSuggestionsPayload,
} from './instruction-suggestion-plugin';

// Text Input Plugin
export {
  instructionTextInputPlugin,
  parseTextInputPayload,
  isValidTextInputPayload,
} from './instruction-text-input-plugin';
export type { TextInputPayload } from './instruction-text-input-plugin';

// Default instruction plugins
export const defaultInstructionPlugins = [
  instructionSuggestionPlugin,
  instructionTextInputPlugin,
];
