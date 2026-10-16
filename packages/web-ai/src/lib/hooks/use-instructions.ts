'use client';

import { useMemo } from 'react';
import type { ChatMessage } from '../types/plugin';
import type { ParsedInstruction } from '../instructions/instruction-types';
import type { InstructionPlugin } from '../plugins/instruction-plugins/types';
import { extractInstructionBlocks, parseAttributes } from '../instructions';
import { getTextFromContentBlocks } from '../utils/stream-helpers';

// ============================================================================
// Types
// ============================================================================

export interface UseInstructionsOptions {
  /** All chat messages */
  messages: ChatMessage[];
  /** Instruction plugins for parsing payloads */
  instructionPlugins?: InstructionPlugin<unknown>[];
}

export interface UseInstructionsReturn {
  /** Parsed instructions from the last assistant message */
  instructions: ParsedInstruction[];
  /** The message ID the instructions belong to */
  messageId: string | null;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that extracts assistant-instructions from the last assistant message.
 *
 * Parses `<assistant-instruction name="...">...</assistant-instruction>` tags
 * from the last completed assistant message's content.
 *
 * Instructions are only available once the message is fully streamed.
 */
export function useInstructions({
  messages,
  instructionPlugins = [],
}: UseInstructionsOptions): UseInstructionsReturn {
  return useMemo(() => {
    // Find the last assistant message
    let lastAssistantMessage: ChatMessage | undefined;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        lastAssistantMessage = messages[i];
        break;
      }
    }


    if (!lastAssistantMessage || lastAssistantMessage.isStreaming) {
      return { instructions: [], messageId: null };
    }

    const text = getTextFromContentBlocks(lastAssistantMessage.content);
    if (!text || !text.includes('<assistant-instruction')) {
      return { instructions: [], messageId: lastAssistantMessage.id };
    }

    // Build parsers map from instruction plugins
    const parsers = new Map<string, (content: string, attributes: Record<string, string>) => unknown>();
    for (const plugin of instructionPlugins) {
      parsers.set(plugin.instructionType, plugin.parsePayload);
    }

    const defaultParser = (content: string) => ({ raw: content });

    // Extract instructions, tolerant of duplicated / unterminated blocks (last complete wins)
    const instructions: ParsedInstruction[] = extractInstructionBlocks(text).map(
      ({ name, attrString, content }) => {
        const attributes = parseAttributes(attrString);
        const parser = parsers.get(name) ?? defaultParser;
        return {
          type: name,
          content,
          payload: parser(content, attributes),
          attributes,
        };
      }
    );

    return {
      instructions,
      messageId: lastAssistantMessage.id,
    };
  }, [messages, instructionPlugins]);
}
