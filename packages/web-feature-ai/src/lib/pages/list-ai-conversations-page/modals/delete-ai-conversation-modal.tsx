import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { AiConversation } from '@skeleton/core-api-models';
import { useDeleteAiConversation } from '@skeleton/core-api';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

type DeleteAiConversationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  conversation: AiConversation;
};

export const DeleteAiConversationModal = ({
  open,
  onOpenChange,
  organizationId,
  conversation,
}: DeleteAiConversationModalProps) => {
  const { t } = useTranslation();
  const deleteAiConversation = useDeleteAiConversation({
    onSuccess: () => {
      toast.success(t('ai.conversation.deleted'));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t('ai.conversation.deleteError'));
    },
  });

  const handleDelete = () => {
    if (!conversation.id) return;
    deleteAiConversation.mutate({
      organizationId,
      conversationId: conversation.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ai.conversation.deleteTitle')}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-start rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="pt-0.5">
            <IconAlertTriangle className="size-4 text-destructive" />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-destructive">
            <p className="text-sm font-medium">
              {t('ai.conversation.deleteName', {
                title: conversation.title ?? t('ai.conversation.untitled'),
              })}
            </p>
            <p className="text-sm">
              {t('ai.conversation.deleteWarning')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            isLoading={deleteAiConversation.isPending}
          >
            <Trash className="size-4" />
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
