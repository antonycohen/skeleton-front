import type { ContentBlock, Delta, WithStreamingMetadata } from '@skeleton/core-api-models';

// ============================================================================
// Delta Plugin Definition
// ============================================================================

/**
 * Delta type from Delta union
 */
export type DeltaType = Delta['type'];

/**
 * Plugin definition for handling delta updates during streaming.
 *
 * Delta plugins handle specific delta types (text_delta, thinking_delta, etc.)
 * and define how they should be applied to the content block state.
 *
 * @template T - The delta type(s) this plugin handles
 */
export interface AiChatDeltaPlugin<T extends DeltaType = DeltaType> {
  /** Unique plugin identifier */
  id: string;

  /** Delta type(s) this plugin handles */
  deltaTypes: T[];

  /**
   * Apply delta to the content block state.
   *
   * @param state - Current accumulated state
   * @param delta - Delta to apply
   * @returns Updated state
   */
  applyDelta: (
    state: WithStreamingMetadata<ContentBlock>,
    delta: Delta
  ) => WithStreamingMetadata<ContentBlock>;

  /**
   * Priority for plugin ordering (higher = processed first).
   * Default: 0
   */
  priority?: number;
}

// ============================================================================
// Factory Helper
// ============================================================================

/**
 * Helper function to create a type-safe delta plugin.
 */
export function createDeltaPlugin<T extends DeltaType>(
  plugin: AiChatDeltaPlugin<T>
): AiChatDeltaPlugin<T> {
  return {
    priority: 0,
    ...plugin,
  };
}
