import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Collection } from '@skeleton/web-collection';
import { useCreateAiConversation, useGetAiConversations } from '@skeleton/core-api';
import { AiConversation } from '@skeleton/core-api-models';
import { LayoutContent, LayoutHeader, LayoutTopbar } from '@skeleton/web-layout';
import { useCurrentWorkspaceUrlPrefix, useGetCurrentWorkspaceId } from '@skeleton/core-workspace';
import { Button } from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';
import { useAiConversationsListColumns } from './hooks/use-ai-conversations-list-columns';
import { DeleteAiConversationModal } from './modals/delete-ai-conversation-modal';

export function ListAiConversationsPage() {
  const { t } = useTranslation();
  const organizationId = useGetCurrentWorkspaceId();
  const workspaceUrl = useCurrentWorkspaceUrlPrefix();
  const navigate = useNavigate();
  const [deleteConversation, setDeleteConversation] = useState<AiConversation | null>(null);

  const conversationUrl = (conversation: AiConversation) =>
    `${workspaceUrl}/assistant/${conversation.id}`;

  const columns = useAiConversationsListColumns({
    conversationUrl,
    onDelete: (conversation) => setDeleteConversation(conversation),
  });

  const createConversation = useCreateAiConversation({
    onSuccess: (conversation) => navigate(conversationUrl(conversation)),
    onError: (error) => {
      toast.error(error.message || t('ai.conversation.createError'));
    },
  });

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar />
      </header>
      <LayoutContent>
        <LayoutHeader
          pageTitle={t('ai.assistant.title')}
          pageDescription={t('ai.assistant.description')}
          actions={
            <Button
              onClick={() => createConversation.mutate({ organizationId, data: {} })}
              isLoading={createConversation.isPending}
            >
              <Plus className="size-4" />
              {t('ai.conversation.new')}
            </Button>
          }
        />
        <Collection
          useLocationAsState
          columns={columns}
          useQueryFn={useGetAiConversations}
          staticParams={{ organizationId }}
          defaultSorting={[{ id: 'updatedAt', desc: true }]}
          queryFields={{
            id: null,
            title: null,
            messagesCount: null,
            lastMessageAt: null,
            updatedAt: null,
          }}
          onRowClick={(conversation) => navigate(conversationUrl(conversation))}
          emptyState={t('ai.conversation.empty')}
        />
      </LayoutContent>

      {deleteConversation && (
        <DeleteAiConversationModal
          open={!!deleteConversation}
          onOpenChange={(open) => !open && setDeleteConversation(null)}
          organizationId={organizationId}
          conversation={deleteConversation}
        />
      )}
    </div>
  );
}
