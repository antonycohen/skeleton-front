import type {
  ChatMessage,
  ContentBlock,
  Delta,
  MessageRole,
  StreamEvent,
  StreamingMetadata,
  WithStreamingMetadata,
} from '@skeleton/core-api-models';

// ============================================================================
// Event Bus Types
// ============================================================================

/**
 * Callback function for stream event subscriptions.
 */
export type StreamEventCallback = (event: StreamEvent) => void;

/**
 * Unsubscribe function returned when subscribing to events.
 */
export type Unsubscribe = () => void;

/**
 * Event bus interface for publishing stream events to AiChat.
 */
export interface AiChatEventBus {
  /** Subscribe to stream events */
  subscribe: (callback: StreamEventCallback) => Unsubscribe;
  /** Publish a stream event */
  publish: (event: StreamEvent) => void;
}

/**
 * Options for creating an AiChat event bus.
 */
export interface AiChatEventBusOptions {
  /** Maximum number of listeners allowed. Default: 100 */
  maxListeners?: number;
}

/**
 * Create a simple event bus for AiChat stream events.
 *
 * @param options - Configuration options
 * @returns Event bus instance
 */
export function createAiChatEventBus(options: AiChatEventBusOptions = {}): AiChatEventBus {
  const { maxListeners = 100 } = options;
  const listeners = new Set<StreamEventCallback>();

  return {
    subscribe: (callback: StreamEventCallback): Unsubscribe => {
      if (listeners.size >= maxListeners) {
        console.warn(
          `[AiChatEventBus] Max listeners (${maxListeners}) reached. ` +
          'New subscription ignored. This may indicate a memory leak.'
        );
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
      }
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    publish: (event: StreamEvent): void => {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error('[AiChatEventBus] Listener error:', error);
        }
      });
    },
  };
}

// ============================================================================
// Chat Actions
// ============================================================================

/**
 * Actions available to plugins to interact with the chat
 */
export interface AiChatActions {
  /** Send a new user message */
  sendMessage: (content: string) => void;
  /** Send tool result back to the conversation */
  sendToolResult: (toolUseId: string, result: string, isError?: boolean) => void;
  /** Add a message to the chat */
  addMessage: (message: ChatMessage) => void;
}

// ============================================================================
// Re-exports from plugin folders
// ============================================================================

// Block plugin types
export type {
  AiChatPlugin,
  AiChatPluginContext,
  BlockType,
} from '../plugins/block-plugins/types';
export { createBlockPlugin } from '../plugins/block-plugins/types';

// Delta plugin types
export type { AiChatDeltaPlugin, DeltaType } from '../plugins/delta-plugins/types';
export { createDeltaPlugin } from '../plugins/delta-plugins/types';

// Input plugin types
export type {
  AiChatInputPlugin,
  AiChatInputPluginContext,
} from '../plugins/input-plugins/types';
export { createInputPlugin } from '../plugins/input-plugins/types';

// ============================================================================
// Re-exports from core-api-models for convenience
// ============================================================================

export type {
  ChatMessage,
  ContentBlock,
  Delta,
  MessageRole,
  StreamEvent,
  StreamingMetadata,
  WithStreamingMetadata,
};
