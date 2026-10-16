'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/plugin';

// ============================================================================
// Types
// ============================================================================

export interface UseAutoScrollOptions {
  /** Current messages array (starts empty, populated after backend fetch) */
  messages: ChatMessage[];
}

export interface UseAutoScrollReturn {
  /** Ref to attach to the scroll container */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Auto-scroll hook for a chat scroll container.
 *
 * Behaviour:
 * 1. Chat starts empty. When messages load from the backend the message
 *    count jumps from 0 → N. We scroll to the bottom after a rAF so the
 *    DOM has settled.
 * 2. When a new message is appended (user or assistant), re-enable
 *    auto-scroll and snap to bottom.
 * 3. A ResizeObserver watches the scrollable content. Whenever the
 *    content height grows (streaming, images loading, etc.) and
 *    auto-scroll is active, we scroll to bottom.
 * 4. If the user scrolls up (wheel / touchmove), disable auto-scroll
 *    until a new message is appended.
 */
export function useAutoScroll({
  messages,
}: UseAutoScrollOptions): UseAutoScrollReturn {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const prevMessageCountRef = useRef(0);
  const lastMessageIdRef = useRef<string | null>(null);
  const autoScrollRef = useRef(true);
  const prevScrollHeightRef = useRef(0);

  const lastMessage = messages[messages.length - 1];

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  // -------------------------------------------------------------------
  // Initial load: messages go from 0 → N (backend fetch completes).
  // Wait one animation frame so the browser has laid out the content.
  // -------------------------------------------------------------------

  useEffect(() => {
    const prev = prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (prev === 0 && messages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages.length, scrollToBottom]);

  // -------------------------------------------------------------------
  // New message appended → re-enable auto-scroll and snap to bottom.
  // -------------------------------------------------------------------

  useEffect(() => {
    const lastId = lastMessage?.id ?? null;

    if (lastId !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastId;
      autoScrollRef.current = true;
      scrollToBottom();
    }
  }, [lastMessage?.id, scrollToBottom]);

  // -------------------------------------------------------------------
  // ResizeObserver: when scrollable content height grows and
  // auto-scroll is active, scroll to bottom. This replaces watching
  // React state — it catches streaming text, images loading, collapsed
  // sections expanding, etc.
  // -------------------------------------------------------------------

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Observe the first (and only) child — the inner content wrapper.
    const content = container.firstElementChild;
    if (!content) return;

    prevScrollHeightRef.current = container.scrollHeight;

    const observer = new ResizeObserver(() => {
      const newHeight = container.scrollHeight;
      if (newHeight > prevScrollHeightRef.current && autoScrollRef.current) {
        scrollToBottom();
      }
      prevScrollHeightRef.current = newHeight;
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, [scrollToBottom]);

  // -------------------------------------------------------------------
  // Detect user-initiated scroll → disable auto-scroll.
  //
  // wheel / touchmove only fire from real user interaction, never from
  // programmatic scrollTop changes.
  // -------------------------------------------------------------------

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onUserScroll = () => {
      autoScrollRef.current = false;
    };

    el.addEventListener('wheel', onUserScroll, { passive: true });
    el.addEventListener('touchmove', onUserScroll, { passive: true });

    return () => {
      el.removeEventListener('wheel', onUserScroll);
      el.removeEventListener('touchmove', onUserScroll);
    };
  }, []);

  return { scrollContainerRef };
}
