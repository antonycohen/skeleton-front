'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ContentBlock, StreamEvent, StreamEventType, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatDeltaPlugin, AiChatEventBus, ChatMessage } from '../types/plugin';
import { createBlockState, finalizeBlockState } from '../utils/stream-helpers';
import { defaultDeltaPlugins, findDeltaPlugin } from '../plugins/delta-plugins';

// ============================================================================
// Types
// ============================================================================

export interface UseStreamEventHandlerOptions {
  /** Event bus for receiving stream events */
  eventBus?: AiChatEventBus;
  /** Delta plugins for handling stream deltas */
  deltaPlugins?: AiChatDeltaPlugin[];
  /** Callback to update messages state */
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  /** Callback to update streaming state */
  setIsStreaming: (isStreaming: boolean) => void;
  /** Callback to update the last received stream event type */
  setLastEventType?: (type: StreamEventType) => void;
  /** Callback when a streamed message is complete */
  onStreamComplete?: (message: ChatMessage) => void;
}

export interface UseStreamEventHandlerReturn {
  /** Reset streaming state (e.g. when clearing messages) */
  reset: () => void;
}

/** Assistant-side block index once the ephemeral context blocks are skipped. */
function shiftIndex(index: number, ephemeralIndices: Set<number>): number {
  let shift = 0;
  for (const ephemeral of ephemeralIndices) {
    if (ephemeral < index) shift++;
  }
  return index - shift;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that subscribes to an event bus and processes stream events
 * into chat message state.
 *
 * Keeps a ref of the streaming message as the single source of truth.
 * Deltas are applied directly to the ref, then synced to React state
 * by replacing the last message in the array. This avoids scanning
 * messages by ID and removes any dependency on stale state.
 *
 * Uses a FIFO queue with re-entrancy guard to guarantee events
 * are always processed in arrival order.
 */
export function useStreamEventHandler({
  eventBus,
  deltaPlugins = defaultDeltaPlugins,
  setMessages,
  setIsStreaming,
  setLastEventType,
  onStreamComplete,
}: UseStreamEventHandlerOptions): UseStreamEventHandlerReturn {
  // Keep callback in a ref to avoid stale closures
  const onStreamCompleteRef = useRef(onStreamComplete);
  onStreamCompleteRef.current = onStreamComplete;

  // The streaming message ref — single source of truth during streaming
  const messageRef = useRef<ChatMessage | null>(null);
  // Content blocks with streaming metadata (index, isComplete, partialJson, etc.)
  const blocksRef = useRef<WithStreamingMetadata<ContentBlock>[]>([]);

  // Stream indices of ephemeral `context` blocks. The backend echoes the
  // turn's resolved selection right after message_start as a normal content
  // block pair, but it belongs to the USER turn (it is persisted on the user
  // message, never on the assistant one) — so it is rerouted there and later
  // assistant block indices are shifted down past it.
  const ephemeralIndicesRef = useRef<Set<number>>(new Set());
  // True between message_start and the first content_block_start: the window
  // in which the context echo (if any) arrives. A first block that is NOT a
  // context echo means the selection was ignored server-side (stale id — the
  // turn ran globally), so the optimistic chip must come off the user turn.
  const awaitingContextEchoRef = useRef(false);

  // FIFO event queue + re-entrancy guard
  const eventQueueRef = useRef<StreamEvent[]>([]);
  const isProcessingRef = useRef(false);

  // ============================================================================
  // Sync the messageRef snapshot into React state (replace last message)
  // ============================================================================

  const flush = useCallback(() => {
    const msg = messageRef.current;
    if (!msg) return;

    const snapshot: ChatMessage = {
      ...msg,
      content: [...blocksRef.current] as ContentBlock[],
    };

    setMessages((prev) => [...prev.slice(0, -1), snapshot]);
  }, [setMessages]);

  // ============================================================================
  // Context echo — attached to the last user message, not the assistant one
  // ============================================================================

  // Replace the last user message's context block(s) with the echoed one —
  // the server-resolved chip (canonical label/variant) wins over whatever the
  // optimistic message carried. `updated === null` strips them instead: the
  // sent selection was ignored and the turn ran globally.
  const setLastUserContext = useCallback(
    (updated: ContentBlock | null) => {
      setMessages((prev) => {
        for (let i = prev.length - 1; i >= 0; i--) {
          const message = prev[i];
          if (message.role?.toLowerCase() !== 'user') continue;

          const withoutContext = message.content.filter(
            (block) => block.type !== 'context'
          );
          if (!updated && withoutContext.length === message.content.length) {
            return prev;
          }

          const next = [...prev];
          next[i] = {
            ...message,
            content: updated ? [...withoutContext, updated] : withoutContext,
          };
          return next;
        }
        return prev;
      });
    },
    [setMessages]
  );

  // ============================================================================
  // Process a single stream event
  // ============================================================================

  const processEvent = useCallback(
    (event: StreamEvent) => {
      switch (event.type) {
        case 'message_start': {
          const msg: ChatMessage = {
            id: event.message.id,
            role: 'assistant',
            content: [],
            createdAt: new Date(),
            isStreaming: true,
          };

          messageRef.current = msg;
          blocksRef.current = [];
          ephemeralIndicesRef.current = new Set();
          awaitingContextEchoRef.current = true;
          setIsStreaming(true);

          // Append new message to state
          setMessages((prev) => [...prev, msg]);
          break;
        }

        case 'content_block_start': {
          if (!messageRef.current) break;

          // The context echo window closes at the first content block: either
          // this IS the echo (adopt the canonical chip on the user turn), or
          // the selection was ignored and the optimistic chip comes off.
          if (awaitingContextEchoRef.current) {
            awaitingContextEchoRef.current = false;
            if (event.contentBlock.type !== 'context') {
              setLastUserContext(null);
            }
          }

          if (event.contentBlock.type === 'context') {
            ephemeralIndicesRef.current.add(event.index);
            setLastUserContext(event.contentBlock);
            break;
          }

          const index = shiftIndex(event.index, ephemeralIndicesRef.current);
          const newBlock = createBlockState(event.contentBlock, index);
          blocksRef.current = [...blocksRef.current];

          // Ensure array has capacity
          while (blocksRef.current.length <= index) {
            blocksRef.current.push(
              createBlockState({ type: 'text', text: '' }, blocksRef.current.length)
            );
          }
          blocksRef.current[index] = newBlock;
          flush();
          break;
        }

        case 'content_block_delta': {
          if (!messageRef.current) break;
          if (ephemeralIndicesRef.current.has(event.index)) break;
          const { delta } = event;
          const index = shiftIndex(event.index, ephemeralIndicesRef.current);

          if (index >= blocksRef.current.length) break;
          const currentState = blocksRef.current[index];
          if (!currentState) break;

          const deltaPlugin = findDeltaPlugin(delta.type, deltaPlugins);

          let newState: WithStreamingMetadata<ContentBlock>;
          if (deltaPlugin) {
            try {
              newState = deltaPlugin.applyDelta(currentState, delta);
            } catch (error) {
              console.error(
                `[useStreamEventHandler] Delta plugin error for "${delta.type}":`,
                error
              );
              newState = currentState;
            }
          } else {
            newState = currentState;
          }

          blocksRef.current = [...blocksRef.current];
          blocksRef.current[index] = newState;
          flush();
          break;
        }

        case 'content_block_stop': {
          if (!messageRef.current) break;
          if (ephemeralIndicesRef.current.has(event.index)) break;
          const index = shiftIndex(event.index, ephemeralIndicesRef.current);

          if (index >= blocksRef.current.length) break;

          blocksRef.current = [...blocksRef.current];
          blocksRef.current[index] = finalizeBlockState(blocksRef.current[index]);
          flush();
          break;
        }

        case 'message_stop': {
          if (!messageRef.current) break;

          // Strip streaming metadata for final content
          const finalContent: ContentBlock[] = blocksRef.current.map(
            ({ index: _i, isComplete: _c, partialJson: _p, signature: _s, ...block }) =>
              block as ContentBlock
          );

          const finalMessage: ChatMessage = {
            ...messageRef.current,
            isStreaming: false,
            content: finalContent,
          };

          setMessages((prev) => [...prev.slice(0, -1), finalMessage]);

          // Notify consumer
          onStreamCompleteRef.current?.(finalMessage);

          // Clean up
          setIsStreaming(false);
          messageRef.current = null;
          blocksRef.current = [];
          ephemeralIndicesRef.current = new Set();
          awaitingContextEchoRef.current = false;
          break;
        }

        case 'error': {
          setIsStreaming(false);

          if (messageRef.current) {
            const errorMessage: ChatMessage = {
              ...messageRef.current,
              isStreaming: false,
            };
            setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
          }

          messageRef.current = null;
          blocksRef.current = [];
          ephemeralIndicesRef.current = new Set();
          awaitingContextEchoRef.current = false;
          break;
        }

        case 'ping':
        case 'message_delta':
          break;
      }
    },
    [deltaPlugins, setMessages, setIsStreaming, flush, setLastUserContext]
  );

  // ============================================================================
  // Queued event handler (FIFO + re-entrancy safe)
  // ============================================================================

  const handleStreamEvent = useCallback(
    (event: StreamEvent) => {
      if (event.type !== 'ping') {
        setLastEventType?.(event.type);
      }

      eventQueueRef.current.push(event);

      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        let next = eventQueueRef.current.shift();
        while (next) {
          processEvent(next);
          next = eventQueueRef.current.shift();
        }
      } finally {
        isProcessingRef.current = false;
      }
    },
    [processEvent, setLastEventType]
  );

  // ============================================================================
  // Subscribe to event bus
  // ============================================================================

  useEffect(() => {
    if (!eventBus) return;

    const unsubscribe = eventBus.subscribe(handleStreamEvent);
    return () => unsubscribe();
  }, [eventBus, handleStreamEvent]);

  // ============================================================================
  // Reset (exposed for clearMessages)
  // ============================================================================

  const reset = useCallback(() => {
    messageRef.current = null;
    blocksRef.current = [];
    ephemeralIndicesRef.current = new Set();
    awaitingContextEchoRef.current = false;
    eventQueueRef.current = [];
    isProcessingRef.current = false;
  }, []);

  return { reset };
}
