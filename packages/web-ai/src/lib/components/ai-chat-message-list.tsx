'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@skeleton/core-utils';
import { Loader2 } from 'lucide-react';
import type { AiChatActions, AiChatPlugin, ChatMessage } from '../types/plugin';
import { AiChatMessage } from './ai-chat-message';
import { AiChatIndicator, type AiChatIndicatorStatus } from './ai-chat-indicator';

// ============================================================================
// Types
// ============================================================================

export interface AiChatMessageListProps {
  /** Additional CSS classes */
  className?: string;
  /** Visual style variant */
  style?: 'compact' | 'large';
  /** Messages to display */
  messages: ChatMessage[];
  /** Plugins for rendering content blocks */
  plugins: AiChatPlugin[];
  /** Chat actions for plugin callbacks */
  actions: AiChatActions;
  /** Ref to the scroll container (owned by AiChat) */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Callback when user scrolls to top to load older messages */
  onLoadMore?: () => void;
  /** Whether older messages are currently being loaded */
  isLoadingMore?: boolean;
  /** Whether there are more messages to load */
  hasMore?: boolean;
  /** Status of the global chat indicator rendered at the end of the list */
  indicatorStatus?: AiChatIndicatorStatus;
  /** Current thinking text — surfaced next to the indicator when status is 'thinking' */
  indicatorThinking?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Renders a list of chat messages.
 *
 * This component does NOT own a scroll container — the parent (AiChat)
 * provides the single scrollable area. This keeps the scroll model flat
 * and lets the sticky input work correctly.
 */
export function AiChatMessageList({
  className,
  style = 'large',
  messages,
  plugins,
  actions,
  scrollContainerRef,
  onLoadMore,
  isLoadingMore,
  hasMore,
  indicatorStatus = 'idle',
  indicatorThinking,
}: AiChatMessageListProps) {
  const topSentinelRef = useRef<HTMLDivElement>(null);

  // Stable refs so the IntersectionObserver callback never goes stale
  const onLoadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const isLoadingMoreRef = useRef(isLoadingMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    hasMoreRef.current = hasMore;
    isLoadingMoreRef.current = isLoadingMore;
  }, [onLoadMore, hasMore, isLoadingMore]);

  // ------------------------------------------------------------------
  // Preserve scroll position when older messages are prepended.
  // Record scrollHeight before React commits the new DOM, then adjust
  // scrollTop by the delta so the visible content doesn't jump.
  // ------------------------------------------------------------------

  const prevMessageCountRef = useRef(messages.length);
  const prevScrollHeightRef = useRef(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const prevCount = prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    // Detect prepend: message count grew while we were loading more
    if (messages.length > prevCount && prevScrollHeightRef.current > 0) {
      const heightDelta = container.scrollHeight - prevScrollHeightRef.current;
      if (heightDelta > 0) {
        container.scrollTop += heightDelta;
      }
      prevScrollHeightRef.current = 0;
    }
  }, [messages.length, scrollContainerRef]);

  // ------------------------------------------------------------------
  // IntersectionObserver: trigger load-more when the sentinel enters
  // the scroll container's visible area.
  // ------------------------------------------------------------------

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreRef.current && !isLoadingMoreRef.current) {
          // Snapshot scroll height before load starts
          prevScrollHeightRef.current = root.scrollHeight;
          onLoadMoreRef.current?.();
        }
      },
      { root, rootMargin: '200px 0px 0px 0px', threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollContainerRef]);

  return (
    <div
      data-slot="ai-chat-message-list"
      className={cn('', className)}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-8 pb-4">
        {/* Top sentinel for load-more detection */}
        <div ref={topSentinelRef} className="h-px" />

        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {messages.map((message) => (
          <AiChatMessage
            key={message.id}
            message={message}
            plugins={plugins}
            actions={actions}
            messages={messages}
            style={style}
          />
        ))}

        {messages.length > 0 && (
          // Compact: no extra inset — the logo aligns with message text at the
          // list's own px-4. Large keeps the px-4 that matches message padding.
          <div className={style === 'compact' ? 'pt-3' : 'px-4 pt-2'}>
            <AiChatIndicator status={indicatorStatus} thinking={indicatorThinking} />
          </div>
        )}
      </div>
    </div>
  );
}
