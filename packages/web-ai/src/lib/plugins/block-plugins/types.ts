import type { ReactNode } from 'react';
import type { ContentBlock, WithStreamingMetadata } from '@skeleton/core-api-models';
import type {
  AiChatActions,
  ChatMessage,
} from '../../types/plugin';

// ============================================================================
// Block Plugin Context
// ============================================================================

/**
 * Context provided to block plugin renderers
 */
export interface AiChatPluginContext {
  /** Whether the content block is currently streaming */
  isStreaming: boolean;
  /** Block index in the message */
  blockIndex: number;
  /** Message ID */
  messageId: string;
  /** Actions to interact with the chat */
  actions: AiChatActions;
  /** Current chat state */
  chatState: {
    messages: ChatMessage[];
    isStreaming: boolean;
  };
}

// ============================================================================
// Block Plugin Definition
// ============================================================================

/**
 * Block type from ContentBlock
 */
export type BlockType = ContentBlock['type'];

/**
 * Plugin definition for rendering content blocks.
 *
 * Plugins handle specific content block types (text, thinking, tool_use, etc.)
 * and define how they should be rendered.
 *
 * @template T - The content block type(s) this plugin handles
 */
export interface AiChatPlugin<T extends BlockType = BlockType> {
  /** Unique plugin identifier */
  id: string;

  /** Content block type(s) this plugin handles */
  blockTypes: T[];

  /**
   * Render the content block.
   * Called during streaming (state.isComplete = false) and when complete (state.isComplete = true).
   *
   * @param state - Accumulated state from deltas
   * @param ctx - Plugin context with actions and chat state
   * @returns React node to render
   */
  render: (state: WithStreamingMetadata<ContentBlock>, ctx: AiChatPluginContext) => ReactNode;

  /**
   * Priority for plugin ordering (higher = rendered first).
   * Default: 0
   */
  priority?: number;
}

// ============================================================================
// Factory Helper
// ============================================================================

/**
 * Helper function to create a type-safe block plugin.
 */
export function createBlockPlugin<T extends BlockType>(
  plugin: AiChatPlugin<T>
): AiChatPlugin<T> {
  return {
    priority: 0,
    ...plugin,
  };
}
