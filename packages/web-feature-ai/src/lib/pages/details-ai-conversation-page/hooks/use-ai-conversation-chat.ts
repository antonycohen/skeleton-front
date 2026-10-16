import { useCallback, useMemo, useState } from 'react';
import { dequal } from 'dequal';
import { skeletonApi, useGetAiConversationMessages } from '@skeleton/core-api';
import { createAiChatEventBus } from '@skeleton/web-ai';
import { useTranslation } from '@skeleton/core-translations';
import type { ChatMessage } from '@skeleton/core-api-models';
import type { AiChatEventBus } from '@skeleton/web-ai';
import { createChatStreamHandlers } from '../../../utils/chat-stream-handlers';

const PAGE_SIZE = 20;

export interface UseAiConversationChatOptions {
  organizationId: string;
  conversationId: string | undefined;
}

export interface UseAiConversationChatReturn {
  messages: ChatMessage[] | undefined;
  eventBus: AiChatEventBus;
  isLoadingMore: boolean;
  hasMore: boolean;
  handleSendMessage: (message: string) => void;
  handleLoadMore: () => void;
}

export function useAiConversationChat({
  organizationId,
  conversationId,
}: UseAiConversationChatOptions): UseAiConversationChatReturn {
  const { t } = useTranslation();
  const eventBus = useMemo(() => createAiChatEventBus(), []);

  // ==========================================================================
  // Message state
  // ==========================================================================

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ==========================================================================
  // Fetch initial messages (newest first — backend returns created DESC)
  // ==========================================================================

  const { data: initialData } = useGetAiConversationMessages(
    {
      staticParams: { organizationId, conversationId: conversationId ?? '' },
      offset: 0,
      limit: PAGE_SIZE,
    },
    {
      enabled: !!conversationId && !isInitialized,
      refetchOnMount: 'always',
    }
  );

  // Derive state during render (React-approved pattern).
  // See: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevData, setPrevData] = useState<ChatMessage[]>();
  if (initialData && !dequal(initialData.data, prevData)) {
    setPrevData(initialData.data);

    const total = initialData.pagination.count;
    if (total > 0) {
      setMessages([...initialData.data].reverse());
      setTotalCount(total);
      setNextOffset(PAGE_SIZE);
      setHasMore(total > PAGE_SIZE);
    }
    setIsInitialized(true);
  }

  // ==========================================================================
  // Load more (older messages — next page in DESC order)
  // ==========================================================================

  const handleLoadMore = useCallback(() => {
    if (!conversationId || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    skeletonApi.aiConversations.getAiConversationMessages({
      staticParams: { organizationId, conversationId },
      offset: nextOffset,
      limit: PAGE_SIZE,
    }).then((response) => {
      setMessages((prev) => [...[...response.data].reverse(), ...prev]);
      const newOffset = nextOffset + response.data.length;
      setNextOffset(newOffset);
      setHasMore(newOffset < totalCount);
      setIsLoadingMore(false);
    }).catch(() => {
      setIsLoadingMore(false);
    });
  }, [organizationId, conversationId, isLoadingMore, hasMore, nextOffset, totalCount]);

  // ==========================================================================
  // Send message
  // ==========================================================================

  const handleSendMessage = useCallback((message: string) => {
    if (!conversationId) return;
    const { onEvent, onError, onComplete } = createChatStreamHandlers(eventBus, {
      interruptedMessage: t('ai.stream.interrupted'),
      errorMessage: t('ai.stream.error'),
      connectionClosedMessage: t('ai.stream.connectionClosed'),
    });
    skeletonApi.aiConversations.postAiConversationMessage(
      organizationId,
      conversationId,
      { message },
      onEvent,
      onError,
      onComplete
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `t` changes identity on every render
  }, [organizationId, conversationId, eventBus]);

  return {
    messages: isInitialized ? messages : undefined,
    eventBus,
    isLoadingMore,
    hasMore,
    handleSendMessage,
    handleLoadMore,
  };
}
