'use client';

import { useEffect, useMemo } from 'react';
import type {
  AiChatInputPlugin,
  AiChatInputPluginContext,
  ChatMessage,
} from '../types/plugin';
import type { ParsedInstruction } from '../instructions/instruction-types';

// ============================================================================
// Types
// ============================================================================

export interface InputPluginRendererProps {
  /** Input plugins to process */
  plugins: AiChatInputPlugin[];
  /** Current chat messages */
  messages: ChatMessage[];
  /** Whether currently streaming */
  isStreaming: boolean;
  /** Set input value callback */
  setInputValue: (value: string) => void;
  /** Send current input callback */
  sendMessage: () => void;
  /** Send specific content callback */
  sendMessageContent: (content: string) => void;
  /** Instructions parsed from the last assistant message */
  instructions: ParsedInstruction[];
  /** Callback when active plugin changes, reports whether default input should be hidden */
  onActivePluginChange?: (replaceDefaultInput: boolean) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Renders input plugin UI based on the last assistant message.
 *
 * Finds the first active plugin (sorted by priority) and renders its UI
 * in the input area above the text input.
 */
export function InputPluginRenderer({
  plugins,
  messages,
  isStreaming,
  setInputValue,
  sendMessage,
  sendMessageContent,
  instructions,
  onActivePluginChange,
}: InputPluginRendererProps) {
  // Find the last assistant message
  const lastAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i];
    }
    return undefined;
  }, [messages]);

  // Find the first active plugin (sorted by priority)
  const activePlugin = useMemo(() => {
    const sorted = [...plugins].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
    return sorted.find((p) => p.shouldActivate(lastAssistantMessage, messages, instructions));
  }, [plugins, lastAssistantMessage, messages, instructions]);

  // Notify parent about whether the active plugin replaces the default input
  useEffect(() => {
    onActivePluginChange?.(activePlugin?.replaceDefaultInput ?? false);
  }, [activePlugin, onActivePluginChange]);

  if (!activePlugin) return null;

  const ctx: AiChatInputPluginContext = {
    setInputValue,
    sendMessage,
    sendMessageContent,
    messages,
    isStreaming,
    instructions,
  };

  return <>{activePlugin.render(ctx)}</>;
}
