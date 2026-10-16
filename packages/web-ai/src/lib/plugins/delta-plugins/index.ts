import { textDeltaPlugin } from './text-delta';
import { thinkingDeltaPlugin } from './thinking-delta';
import { signatureDeltaPlugin } from './signature-delta';
import { inputJsonDeltaPlugin } from './input-json-delta';
import type { AiChatDeltaPlugin } from './types';

// Types
export type { AiChatDeltaPlugin, DeltaType } from './types';
export { createDeltaPlugin } from './types';

// Delta Plugins
export { textDeltaPlugin } from './text-delta';
export { thinkingDeltaPlugin } from './thinking-delta';
export { signatureDeltaPlugin } from './signature-delta';
export { inputJsonDeltaPlugin } from './input-json-delta';

/**
 * Default set of delta plugins for AiChat.
 * Includes text, thinking, signature, and input JSON delta plugins.
 */
export const defaultDeltaPlugins: AiChatDeltaPlugin[] = [
  textDeltaPlugin,
  thinkingDeltaPlugin,
  signatureDeltaPlugin,
  inputJsonDeltaPlugin,
];

/**
 * Get all default delta plugins sorted by priority (highest first).
 */
export function getDefaultDeltaPlugins(): AiChatDeltaPlugin[] {
  return [...defaultDeltaPlugins].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/**
 * Find a delta plugin that handles the given delta type.
 */
export function findDeltaPlugin(
  deltaType: string,
  plugins: AiChatDeltaPlugin[]
): AiChatDeltaPlugin | undefined {
  return plugins.find((plugin) =>
    plugin.deltaTypes.includes(deltaType as AiChatDeltaPlugin['deltaTypes'][number])
  );
}
