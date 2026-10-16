import {textPlugin} from './block-plugins/text';
import {webSearchPlugin} from './block-plugins/web-search';
import {suggestionsInputPlugin} from './input-plugins/suggestions';
import {textInputPlugin} from './input-plugins/text-input';
import {instructionSuggestionPlugin} from './instruction-plugins/instruction-suggestion-plugin';
import {instructionTextInputPlugin} from './instruction-plugins/instruction-text-input-plugin';
import type {AiChatPlugin} from './block-plugins/types';
import type {AiChatInputPlugin} from './input-plugins/types';
import type {InstructionPlugin} from './instruction-plugins/types';

// Plugin Registry
export {
  AiChatPluginRegistry,
  createPluginRegistry,
  findPluginForType,
} from './registry';

// Block Plugin Types
export type { AiChatPlugin, AiChatPluginContext, BlockType } from './block-plugins/types';
export { createBlockPlugin } from './block-plugins/types';

// Block Plugins
export { textPlugin, TextContent } from './block-plugins/text';
export { thinkingPlugin, ThinkingContent } from './block-plugins/thinking';
export { toolUsePlugin, ToolUseContent } from './block-plugins/tool-use';
export { webSearchPlugin, WebSearchContent } from './block-plugins/web-search';
export { UnknownBlockFallback, renderUnknownBlock } from './block-plugins/unknown';

// Delta Plugin Types
export type { AiChatDeltaPlugin, DeltaType } from './delta-plugins/types';
export { createDeltaPlugin } from './delta-plugins/types';

// Delta Plugins
export {
  textDeltaPlugin,
  thinkingDeltaPlugin,
  signatureDeltaPlugin,
  inputJsonDeltaPlugin,
  defaultDeltaPlugins,
  getDefaultDeltaPlugins,
  findDeltaPlugin,
} from './delta-plugins';

// Input Plugin Types
export type { AiChatInputPlugin, AiChatInputPluginContext } from './input-plugins/types';
export { createInputPlugin } from './input-plugins/types';

// Input Plugins
export {
  suggestionsInputPlugin,
  SuggestionChips as InputSuggestionChips,
  textInputPlugin,
  TextInputField,
} from './input-plugins';

// Instruction Plugin Types
export type { InstructionPlugin, InstructionPluginContext } from './instruction-plugins/types';
export { createInstructionPlugin } from './instruction-plugins/types';

// Instruction Plugins
export {
  instructionSuggestionPlugin,
  parseSuggestionsPayload,
  isValidSuggestionsPayload,
  instructionTextInputPlugin,
  parseTextInputPayload,
  isValidTextInputPayload,
  defaultInstructionPlugins,
} from './instruction-plugins';
export type { TextInputPayload } from './instruction-plugins';

/**
 * Default set of block plugins for AiChat.
 * Thinking is rendered globally by <AiChatIndicator>, so the thinking
 * block plugin is intentionally excluded from the defaults.
 */
export const defaultBlockPlugins: AiChatPlugin[] = [
  textPlugin,
  webSearchPlugin,
];

/**
 * Get all default block plugins sorted by priority (highest first).
 */
export function getDefaultBlockPlugins(): AiChatPlugin[] {
  return [...defaultBlockPlugins].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/**
 * Default set of input plugins for AiChat.
 * Includes suggestions input plugin for rendering suggestion chips.
 */
export const defaultInputPlugins: AiChatInputPlugin[] = [
  suggestionsInputPlugin,
  textInputPlugin,
];

/**
 * Get all default input plugins sorted by priority (highest first).
 */
export function getDefaultInputPlugins(): AiChatInputPlugin[] {
  return [...defaultInputPlugins].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );
}

/**
 * Get all default instruction plugins sorted by priority (highest first).
 */
export function getDefaultInstructionPlugins(): InstructionPlugin<unknown>[] {
  return ([
    instructionSuggestionPlugin,
    instructionTextInputPlugin,
  ] as InstructionPlugin<unknown>[]).sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );
}

// Legacy aliases for backward compatibility
export const defaultPlugins = defaultBlockPlugins;
export const getDefaultPlugins = getDefaultBlockPlugins;
