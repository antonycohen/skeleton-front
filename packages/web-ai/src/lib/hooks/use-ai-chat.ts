'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ContextContentBlock, StreamEventType} from '@skeleton/core-api-models';
import type {
  AiChatActions,
  AiChatDeltaPlugin,
  AiChatEventBus,
  ChatMessage,
} from '../types/plugin';
import {generateMessageId} from '../utils/stream-helpers';
import {useStreamEventHandler} from './use-stream-event-handler';
import type {AiChatIndicatorStatus} from '../components/ai-chat-indicator';

const SUCCESS_DISPLAY_MS = 2000;

// ============================================================================
// Types
// ============================================================================

export interface UseAiChatOptions {
  /** Initial messages to display */
  initialMessages?: ChatMessage[];
  /** Externally controlled messages (overrides internal state when changed) */
  messages?: ChatMessage[];
  /** Callback when user sends a message */
  onSendMessage?: (message: string) => void;
  /** Callback when tool result is sent */
  onSendToolResult?: (toolUseId: string, result: string, isError?: boolean) => void;
  /** Event bus for receiving stream events */
  eventBus?: AiChatEventBus;
  /** Delta plugins for handling stream deltas */
  deltaPlugins?: AiChatDeltaPlugin[];
  /** Callback when a streamed message is complete */
  onStreamComplete?: (message: ChatMessage) => void;
  /**
   * The selection context the composer currently carries (a block chip).
   * Appended to the optimistic user message so the chip shows immediately;
   * the stream's canonical context echo then replaces it — or strips it, if
   * the selection didn't resolve server-side and the turn ran globally.
   */
  composerContextBlock?: ContextContentBlock | null;
}

export interface UseAiChatReturn {
  /** Current messages */
  messages: ChatMessage[];
  /** Current input value */
  inputValue: string;
  /** Set input value */
  setInputValue: (value: string) => void;
  /** Whether currently streaming */
  isStreaming: boolean;
  /** Type of the most recently received stream event (excluding ping) */
  lastEventType: StreamEventType | null;
  /** True for SUCCESS_DISPLAY_MS after a non-error stream completion */
  successActive: boolean;
  /** Live chat indicator status — derived from streaming/success/error/idle */
  indicatorStatus: AiChatIndicatorStatus;
  /** Current thinking text — last assistant message's trailing thinking block, while streaming */
  thinkingText: string | undefined;
  /** Send the current input as a message */
  sendMessage: () => void;
  /** Send a tool result */
  sendToolResult: (toolUseId: string, result: string, isError?: boolean) => void;
  /** Add a message to the chat */
  addMessage: (message: ChatMessage) => void;
  /** Prepend messages at the beginning (for loading older messages) */
  prependMessages: (messages: ChatMessage[]) => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Actions object for plugins */
  actions: AiChatActions;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for managing AI chat state and stream event handling.
 */
export function useAiChat({
  initialMessages = [],
  messages: externalMessages,
  onSendMessage,
  onSendToolResult,
  eventBus,
  deltaPlugins,
  onStreamComplete,
  composerContextBlock,
}: UseAiChatOptions = {}): UseAiChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(externalMessages ?? initialMessages);

  // Sync with external messages when they change (React-recommended pattern)
  const [prevExternalMessages, setPrevExternalMessages] = useState(externalMessages);
  if (externalMessages && externalMessages !== prevExternalMessages) {
    setPrevExternalMessages(externalMessages);
    setMessages(externalMessages);
  }

  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastEventType, setLastEventType] = useState<StreamEventType | null>(null);

  // Track isStreaming transitions to drive the 2s success window.
  // Adjust state during render — React-approved pattern for prop-derived state.
  const [prevIsStreaming, setPrevIsStreaming] = useState(isStreaming);
  const [successActive, setSuccessActive] = useState(false);
  // Mirror the same value we just scheduled so the indicator status this render
  // uses the post-update state instead of the stale closure value.
  let nextSuccessActive = successActive;
  if (prevIsStreaming !== isStreaming) {
    setPrevIsStreaming(isStreaming);
    if (prevIsStreaming && !isStreaming && lastEventType !== 'error') {
      nextSuccessActive = true;
      setSuccessActive(true);
    } else if (successActive) {
      nextSuccessActive = false;
      setSuccessActive(false);
    }
  }
  useEffect(() => {
    if (!successActive) return;
    const timer = setTimeout(() => setSuccessActive(false), SUCCESS_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [successActive]);

  const indicatorStatus: AiChatIndicatorStatus = isStreaming
    ? 'thinking'
    : lastEventType === 'error'
      ? 'error'
      : nextSuccessActive
        ? 'success'
        : 'idle';

  // Surface the in-flight thinking text so <AiChatIndicator> can render it
  // alongside the lottie. Only the trailing thinking block matters: once the
  // assistant starts producing the response, the thinking is no longer last.
  const thinkingText = useMemo(() => {
    if (!isStreaming) return undefined;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') return undefined;
    const lastBlock = lastMessage.content[lastMessage.content.length - 1];
    if (!lastBlock || lastBlock.type !== 'thinking') return undefined;
    return lastBlock.thinking;
  }, [messages, isStreaming]);

  // ============================================================================
  // Stream event handling (delegated to dedicated hook)
  // ============================================================================

  const { reset: resetStreamState } = useStreamEventHandler({
    eventBus,
    deltaPlugins,
    setMessages,
    setIsStreaming,
    setLastEventType,
    onStreamComplete,
  });

  // ============================================================================
  // Message Actions
  // ============================================================================

  // Ref so `sendMessage` (and the `actions` object built from it) keeps a
  // stable identity across selection changes.
  const composerContextBlockRef = useRef(composerContextBlock);
  useEffect(() => {
    composerContextBlockRef.current = composerContextBlock;
  }, [composerContextBlock]);

  const sendMessage = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isStreaming) return;

    const contextBlock = composerContextBlockRef.current;
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: [
        { type: 'text', text: trimmedValue },
        ...(contextBlock ? [contextBlock] : []),
      ],
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    onSendMessage?.(trimmedValue);
  }, [inputValue, isStreaming, onSendMessage]);

  const sendToolResult = useCallback(
    (toolUseId: string, result: string, isError?: boolean) => {
      onSendToolResult?.(toolUseId, result, isError);
    },
    [onSendToolResult]
  );

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const prependMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages((prev) => [...msgs, ...prev]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsStreaming(false);
    setLastEventType(null);
    resetStreamState();
  }, [resetStreamState]);

  // ============================================================================
  // Actions object for plugins
  // ============================================================================

  const actions: AiChatActions = useMemo(
    () => ({
      sendMessage: (content: string) => {
        setInputValue(content);
        setTimeout(() => sendMessage(), 0);
      },
      sendToolResult,
      addMessage,
    }),
    [sendMessage, sendToolResult, addMessage]
  );

  // ============================================================================
  // Return
  // ============================================================================

  return {
    messages,
    inputValue,
    setInputValue,
    isStreaming,
    lastEventType,
    successActive,
    indicatorStatus,
    thinkingText,
    sendMessage,
    sendToolResult,
    addMessage,
    prependMessages,
    clearMessages,
    actions,
  };
}
