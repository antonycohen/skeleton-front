import { ColumnDef } from '@tanstack/react-table';
import { AiConversation } from '@skeleton/core-api-models';
import { CollectionColumnHeader, CollectionRowActions } from '@skeleton/web-collection';
import { format } from 'date-fns';
import { MessageSquare, Trash } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

type UseAiConversationsListColumnsOptions = {
  conversationUrl: (conversation: AiConversation) => string;
  onDelete?: (conversation: AiConversation) => void;
};

export function useAiConversationsListColumns(
  options: UseAiConversationsListColumnsOptions,
): ColumnDef<AiConversation>[] {
  const { conversationUrl, onDelete } = options;
  const { t } = useTranslation();

  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('ai.conversation.columns.conversation')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          {row.original.title ?? t('ai.conversation.untitled')}
        </span>
      ),
      meta: { className: 'min-w-[240px]' },
      enableSorting: true,
    },
    {
      accessorKey: 'messagesCount',
      header: () => <span>{t('ai.conversation.columns.messages')}</span>,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.messagesCount ?? 0}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('ai.conversation.columns.lastActivity')} />
      ),
      cell: ({ row }) => {
        const date = row.original.lastMessageAt ?? row.original.updatedAt;
        return (
          <span className="text-sm">
            {date ? format(date, 'dd/MM/yyyy HH:mm') : '-'}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions')}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <CollectionRowActions
            row={row}
            actions={[
              {
                label: t('ai.conversation.open'),
                icon: MessageSquare,
                linkTo: conversationUrl,
              },
              {
                label: t('common.delete'),
                icon: Trash,
                group: 'danger',
                className: 'text-red-500!',
                onClick: (conversation: AiConversation) => {
                  onDelete?.(conversation);
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];
}
