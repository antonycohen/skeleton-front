import { useParams } from 'react-router-dom';
import { useGetAiConversationById } from '@skeleton/core-api';
import { useCurrentWorkspaceUrlPrefix, useGetCurrentWorkspaceId } from '@skeleton/core-workspace';
import { AiChat } from '@skeleton/web-ai';
import { useTranslation } from '@skeleton/core-translations';
import { LayoutTopbar, useBreadcrumb } from '@skeleton/web-layout';
import { useAiConversationChat } from './hooks/use-ai-conversation-chat';

export function DetailsAiConversationPage() {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const organizationId = useGetCurrentWorkspaceId();
  const workspaceUrl = useCurrentWorkspaceUrlPrefix();

  const { data: conversation } = useGetAiConversationById(
    {
      id: conversationId ?? '',
      staticParams: { organizationId },
      fields: { id: null, title: null },
    },
    { enabled: !!conversationId },
  );

  const {
    messages,
    eventBus,
    isLoadingMore,
    hasMore,
    handleSendMessage,
    handleLoadMore,
  } = useAiConversationChat({ organizationId, conversationId });

  const breadcrumbs = useBreadcrumb(
    [
      { label: t('ai.assistant.title'), to: `${workspaceUrl}/assistant` },
      { label: conversation?.title ?? t('ai.conversation.untitled') },
    ],
    true,
  );

  return (
    <div className="flex h-svh flex-col">
      <header className="sticky top-0 z-30">
        <LayoutTopbar breadcrumbs={breadcrumbs} />
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 pb-4">
        {messages && (
          <AiChat
            className="flex-1"
            messages={messages}
            eventBus={eventBus}
            onSendMessage={handleSendMessage}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            placeholder={t('ai.conversation.placeholder')}
            emptyState={
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <p className="text-lg font-semibold">{t('ai.conversation.emptyTitle')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('ai.conversation.emptyDescription')}
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
