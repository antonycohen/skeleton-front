'use client';

import type {ContentBlock, WithStreamingMetadata} from '@skeleton/core-api-models';
import type {AiChatActions, AiChatPlugin, AiChatPluginContext, ChatMessage,} from '../types/plugin';
import {findPluginForType} from '../plugins';

// ============================================================================
// Types
// ============================================================================

export interface ContentBlockRendererProps {
  /** Content blocks from streaming state */
  blocks: ContentBlock[] | undefined;
  /** Completed content blocks from API response */
  completedBlocks?: ContentBlock[];
  /** Whether the message is currently streaming */
  isStreaming: boolean;
  /** Message ID for context */
  messageId: string;
  /** Plugins for rendering different block types */
  plugins: AiChatPlugin[];
  /** Chat actions for plugin callbacks */
  actions: AiChatActions;
  /** All messages for context */
  messages: ChatMessage[];
}

// ============================================================================
// Component
// ============================================================================

/**
 * Renders content blocks using the appropriate plugin for each block type.
 *
 * Handles three scenarios:
 * 1. Streaming with stream state blocks
 * 2. Completed with API response blocks
 * 3. Completed with stream state blocks (post-streaming)
 */
export function ContentBlockRenderer({
  blocks,
  completedBlocks,
  isStreaming,
  messageId,
  plugins,
  actions,
  messages,
}: ContentBlockRendererProps) {
  // Scenario 1: Streaming with stream state (blocks contain streaming metadata via cast)
  if (isStreaming && blocks && blocks.length > 0) {
    return (
      <>
        {blocks.map((block, index) =>
          block ? (
            <BlockRenderer
              key={`block-${index}`}
              block={block as WithStreamingMetadata<ContentBlock>}
              index={index}
              messageId={messageId}
              plugins={plugins}
              actions={actions}
              messages={messages}
              chatIsStreaming={true}
            />
          ) : null
        )}
      </>
    );
  }

  // Scenario 2: Completed with API response blocks (convert to stream state format)
  if (completedBlocks && completedBlocks.length > 0) {
    return (
      <>
        {completedBlocks.map((block, index) => {
          const streamState: WithStreamingMetadata<ContentBlock> = {
            ...block,
            index,
            isComplete: true,
          };

          return (
            <BlockRenderer
              key={`block-${index}`}
              block={streamState}
              index={index}
              messageId={messageId}
              plugins={plugins}
              actions={actions}
              messages={messages}
              chatIsStreaming={false}
            />
          );
        })}
      </>
    );
  }

  // Scenario 3: Completed with plain content blocks
  if (blocks && blocks.length > 0) {
    return (
      <>
        {blocks.map((block, index) =>
          block ? (
            <BlockRenderer
              key={`block-${index}`}
              block={{ ...block, index, isComplete: true } as WithStreamingMetadata<ContentBlock>}
              index={index}
              messageId={messageId}
              plugins={plugins}
              actions={actions}
              messages={messages}
              chatIsStreaming={false}
            />
          ) : null
        )}
      </>
    );
  }

  return null;
}

// ============================================================================
// Sub-components
// ============================================================================

interface BlockRendererProps {
  block: WithStreamingMetadata<ContentBlock>;
  index: number;
  messageId: string;
  plugins: AiChatPlugin[];
  actions: AiChatActions;
  messages: ChatMessage[];
  chatIsStreaming: boolean;
}

function BlockRenderer({
  block,
  index,
  messageId,
  plugins,
  actions,
  messages,
  chatIsStreaming,
}: BlockRendererProps) {
  const plugin = findPluginForType(block.type, plugins);
  const ctx: AiChatPluginContext = {
    isStreaming: false,
    blockIndex: index,
    messageId,
    actions,
    chatState: { messages, isStreaming: chatIsStreaming },
  };

  if (!plugin) {
    return null;
  }

  return <>{plugin.render(block, ctx)}</>;
}
