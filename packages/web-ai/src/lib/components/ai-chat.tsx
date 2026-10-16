'use client';

import {type ReactNode, useCallback, useEffect, useMemo, useRef} from 'react';
import {cn} from '@skeleton/core-utils';
import type {ContextContentBlock} from '@skeleton/core-api-models';
import type {AiChatEventBus, AiChatPlugin, ChatMessage, AiChatInputPlugin} from '../types/plugin';
import {getDefaultInputPlugins, getDefaultPlugins, getDefaultInstructionPlugins} from '../plugins';
import {useAiChat} from '../hooks/use-ai-chat';
import {useInstructions} from '../hooks/use-instructions';
import {generateMessageId} from '../utils/stream-helpers';
import {useAutoScroll} from '../hooks/use-auto-scroll';
import {AiChatMessageList} from './ai-chat-message-list';
import {AiChatInput} from './ai-chat-input';
import type {AiChatIndicatorStatus} from './ai-chat-indicator';

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { MessageRole, ChatMessage, AiChatEventBus } from '../types/plugin';
export { createAiChatEventBus } from '../types/plugin';

// ============================================================================
// Types
// ============================================================================

export interface AiChatProps {
  /** Additional CSS classes */
  className?: string;
  /** Visual style variant */
  theme?: 'compact' | 'large';
  /** Initial messages to display */
  initialMessages?: ChatMessage[];
  /** Externally controlled messages (overrides initialMessages when provided) */
  messages?: ChatMessage[];
  /** Callback when user sends a message */
  onSendMessage?: (message: string) => void;
  /** Callback when tool result is sent */
  onSendToolResult?: (toolUseId: string, result: string, isError?: boolean) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the composer input is disabled */
  disabled?: boolean;
  /**
   * Overrides the status indicator derived from the stream — e.g. 'thinking'
   * while work the chat doesn't stream (a page regeneration) is in flight.
   */
  indicatorStatus?: AiChatIndicatorStatus;
  /** Custom plugins for rendering content blocks */
  plugins?: AiChatPlugin[];
  /** Whether to use default plugins (text, thinking, tool_use, web_search). Default: true */
  useDefaultPlugins?: boolean;
  /** Custom input plugins for rendering in input area */
  inputPlugins?: AiChatInputPlugin[];
  /** Whether to use default input plugins (suggestions). Default: true */
  useDefaultInputPlugins?: boolean;
  /** Event bus for receiving stream events from external sources */
  eventBus?: AiChatEventBus;
  /** Callback when user scrolls to top to load older messages */
  onLoadMore?: () => void;
  /** Whether older messages are currently being loaded */
  isLoadingMore?: boolean;
  /** Whether there are more messages to load */
  hasMore?: boolean;
  /** Element to render when messages are empty */
  emptyState?: ReactNode;
  /** Callback when a streamed message is complete */
  onStreamComplete?: (message: ChatMessage) => void;
  /** Message to send programmatically (consumed once, then caller should clear it) */
  pendingMessage?: string | null;
  /** Called after pendingMessage has been consumed */
  onPendingMessageConsumed?: () => void;
  /**
   * The selection context the composer currently carries (a block chip).
   * Appended to the optimistic user message so the chip renders immediately;
   * the stream's canonical context echo then replaces or strips it.
   */
  composerContextBlock?: ContextContentBlock | null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AI Chat component with streaming support and plugin-based content rendering.
 *
 * @example
 * ```tsx
 * // Basic usage with event bus
 * const eventBus = createAiChatEventBus();
 *
 * <AiChat
 *   eventBus={eventBus}
 *   onSendMessage={(message) => {
 *     // Start your API call and publish events
 *     streamingApi.send(message, (event) => eventBus.publish(event));
 *   }}
 * />
 * ```
 */
export function AiChat({
  className,
  theme = 'large',
  initialMessages = [],
  messages: externalMessages,
  onSendMessage,
  onSendToolResult,
  placeholder,
  disabled,
  indicatorStatus: indicatorStatusOverride,
  plugins: customPlugins,
  useDefaultPlugins = true,
  inputPlugins: customInputPlugins,
  useDefaultInputPlugins = true,
  eventBus,
  onLoadMore,
  isLoadingMore,
  hasMore,
  emptyState,
  onStreamComplete,
  pendingMessage,
  onPendingMessageConsumed,
  composerContextBlock,
}: AiChatProps) {
  // Merge and sort plugins by priority
  const plugins = useMemo(() => {
    const defaultPluginList = useDefaultPlugins ? getDefaultPlugins() : [];
    const customPluginList = customPlugins ?? [];
    const merged = [...customPluginList, ...defaultPluginList];
    return merged.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [customPlugins, useDefaultPlugins]);

  // Merge and sort input plugins by priority
  const inputPlugins = useMemo(() => {
    const defaultPluginList = useDefaultInputPlugins
      ? getDefaultInputPlugins()
      : [];
    const customPluginList = customInputPlugins ?? [];
    const merged = [...customPluginList, ...defaultPluginList];
    return merged.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [customInputPlugins, useDefaultInputPlugins]);

  // Chat state and actions
  const {
    messages,
    inputValue,
    setInputValue,
    isStreaming,
    indicatorStatus,
    thinkingText,
    sendMessage,
    addMessage,
    actions,
  } = useAiChat({
    initialMessages,
    messages: externalMessages,
    onSendMessage,
    onSendToolResult,
    eventBus,
    onStreamComplete,
    composerContextBlock,
  });

  // Extract instructions from last assistant message
  const { instructions } = useInstructions({
    messages,
    instructionPlugins: getDefaultInstructionPlugins(),
  });


  // Send a specific message content directly. The composer's selection chip
  // applies here too — the host sends this message through the same
  // context-scoped path as a typed one.
  const composerContextBlockRef = useRef(composerContextBlock);
  useEffect(() => {
    composerContextBlockRef.current = composerContextBlock;
  }, [composerContextBlock]);

  const sendMessageContent = useCallback(
    (content: string) => {
      const contextBlock = composerContextBlockRef.current;
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: [
          { type: 'text', text: content },
          ...(contextBlock ? [contextBlock] : []),
        ],
        createdAt: new Date(),
      };
      addMessage(userMessage);
      onSendMessage?.(content);
    },
    [addMessage, onSendMessage]
  );

  // Consume pending message from external source.
  // Wait until conversation history has loaded (messages !== undefined)
  // and guard against duplicate sends when callback references change.
  const lastSentPendingRef = useRef<string | null>(null);
  const historyLoaded = externalMessages !== undefined;
  useEffect(() => {
    if (!pendingMessage || !historyLoaded || pendingMessage === lastSentPendingRef.current) return;
    lastSentPendingRef.current = pendingMessage;
    sendMessageContent(pendingMessage);
    onPendingMessageConsumed?.();
  }, [pendingMessage, historyLoaded, sendMessageContent, onPendingMessageConsumed]);

  // Reset guard when pendingMessage is cleared
  useEffect(() => {
    if (!pendingMessage) {
      lastSentPendingRef.current = null;
    }
  }, [pendingMessage]);

  const { scrollContainerRef } = useAutoScroll({ messages });

  return (
    <div
      ref={scrollContainerRef}
      data-slot="ai-chat"
      className={cn(
        'h-full w-full overflow-y-auto overscroll-contain bg-background',
        className,
      )}
    >
      {/* Inner wrapper: min-h-full so the input sits at the bottom
          even when there are few messages (flex-1 pushes it down). */}
      <div className="flex min-h-full flex-col">
        {/* Top fade — messages dissolve as they scroll under the top edge.
            -mb-14 cancels its height so it doesn't push content down. */}
        <div className="pointer-events-none sticky top-0 z-10 -mb-14 h-14 shrink-0 bg-gradient-to-b from-background to-transparent" />

        {/* Empty state — shown when no messages */}
        {emptyState && messages.length === 0 && (
          <div className="px-4 pt-4">{emptyState}</div>
        )}

        {/* Messages — natural flow, no overflow */}
        <AiChatMessageList
          messages={messages}
          plugins={plugins}
          actions={actions}
          className="flex-1"
          style={theme}
          scrollContainerRef={scrollContainerRef}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          indicatorStatus={indicatorStatusOverride ?? indicatorStatus}
          indicatorThinking={thinkingText}
        />

        {/* Input — sticky to the bottom of the visible area */}
        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-4 pt-6">
          <div className="mx-auto w-full max-w-3xl px-4">
            <AiChatInput
              value={inputValue}
              onValueChange={setInputValue}
              onSubmit={sendMessage}
              placeholder={placeholder}
              disabled={disabled}
              isLoading={isStreaming}
              inputPlugins={inputPlugins}
              messages={messages}
              sendMessageContent={sendMessageContent}
              instructions={instructions}
              style={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
