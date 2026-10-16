'use client';

import {MousePointer2} from 'lucide-react';
import {cn} from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import type {ContextContentBlock} from '@skeleton/core-api-models';
import type {AiChatActions, AiChatPlugin, ChatMessage} from '../types/plugin';
import {getTextFromContentBlocks} from '../utils/stream-helpers';
import {ContentBlockRenderer} from './content-block-renderer';
import {Streamdown} from "streamdown";

// ============================================================================
// Types
// ============================================================================

export interface AiChatMessageProps {
  /** Additional CSS classes */
  className?: string;
  /** Visual style variant */
  style?: 'compact' | 'large';
  /** The message to render */
  message: ChatMessage;
  /** Plugins for rendering content blocks */
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
 * Renders a single chat message.
 *
 * User messages are displayed as right-aligned bubbles.
 * Assistant messages render their content. The live chat status is shown
 * globally by <AiChatIndicator />, not per-message.
 */
export function AiChatMessage({
  className,
  style = 'large',
  message,
  plugins,
  actions,
  messages,
}: AiChatMessageProps) {
  const isUser = message.role?.toLowerCase() === 'user';
  const hasContentBlocks = Boolean(
    message.content && message.content.length > 0
  );

  if (isUser) {
    // The selection the turn was scoped to, stored alongside the verbatim
    // text (old conversations carry the rewritten text and no context block —
    // they render as plain text, chip-less).
    const contextBlocks = message.content.filter(
      (block): block is ContextContentBlock => block.type === 'context'
    );
    return (
      <UserMessage
        className={className}
        style={style}
        content={getTextFromContentBlocks(message.content)}
        contextBlocks={contextBlocks}
      />
    );
  }

  return (
    <AssistantMessage
      className={className}
      style={style}
      message={message}
      hasContentBlocks={hasContentBlocks}
      plugins={plugins}
      actions={actions}
      messages={messages}
    />
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface UserMessageProps {
  className?: string;
  style?: 'compact' | 'large';
  content: string;
  /** Selection context the turn was scoped to — rendered as chips inside the bubble. */
  contextBlocks?: ContextContentBlock[];
}

function UserMessage({ className, style = 'large', content, contextBlocks = [] }: UserMessageProps) {
  const { t } = useTranslation();
  const isCompact = style === 'compact';
  return (
    <div
      data-slot="ai-chat-message"
      className={cn(
        'flex items-start justify-end gap-2 py-3',
        // Compact: the list wrapper's px-4 is the full inset; large adds its own.
        !isCompact && 'px-4',
        className,
      )}
    >
      {/* The context chips sit inside the bubble, above the text — the same
          chip the composer shows while the selection is pending. */}
      <div className={cn(
        'flex max-w-[85%] flex-col items-start gap-1 rounded-bl-2xl rounded-br-2xl rounded-tl-2xl rounded-tr-none bg-muted px-4 py-3 text-foreground',
        isCompact ? 'text-sm leading-5' : 'text-base leading-6',
      )}>
        {contextBlocks.map((block, index) => (
          <span
            key={block.id ?? index}
            data-slot="ai-chat-message-context"
            className="flex h-8 max-w-full items-center gap-1 rounded-full border border-border bg-muted p-2 text-sm leading-5 text-foreground"
          >
            <MousePointer2 className="size-3 shrink-0" />
            <span className="truncate px-1">
              {block.label || block.id || t('ai.chat.selectedItem')}
            </span>
          </span>
        ))}
        <Streamdown>{content}</Streamdown>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  className?: string;
  style?: 'compact' | 'large';
  message: ChatMessage;
  hasContentBlocks: boolean;
  plugins: AiChatPlugin[];
  actions: AiChatActions;
  messages: ChatMessage[];
}

function AssistantMessage({
  className,
  style = 'large',
  message,
  hasContentBlocks,
  plugins,
  actions,
  messages,
}: AssistantMessageProps) {
  const isCompact = style === 'compact';
  return (
    <div
      data-slot="ai-chat-message"
      className={cn(
        isCompact
          ? 'flex flex-col gap-2'
          : 'flex items-start gap-2 px-4 py-3',
        className,
      )}
    >
      <div className={cn(
        isCompact ? 'py-3 text-sm leading-5' : 'py-1 min-w-0 flex-1',
      )}>
        {hasContentBlocks ? (
          <ContentBlockRenderer
            blocks={message.content}
            isStreaming={message.isStreaming ?? false}
            messageId={message.id}
            plugins={plugins}
            actions={actions}
            messages={messages}
          />
        ) : (
          <PlainTextContent
            content={getTextFromContentBlocks(message.content)}
            isStreaming={message.isStreaming}
            style={style}
          />
        )}
      </div>
    </div>
  );
}

interface PlainTextContentProps {
  content: string;
  isStreaming?: boolean;
  style?: 'compact' | 'large';
}

function PlainTextContent({ content, isStreaming, style = 'large' }: PlainTextContentProps) {
  return (
    <div className={cn(
      'text-foreground',
      style === 'compact' ? 'text-sm leading-5' : 'text-base leading-6',
    )}>
      {content}
      {isStreaming && (
        <span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-muted-foreground" />
      )}
    </div>
  );
}
