import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { AiConversation } from '@skeleton/core-api-models';
import { useDeleteAiConversation } from '@skeleton/core-api';
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
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('ai.conversation.deleteTitle')}</DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <DialogDescription className="text-foreground">
            <span className="font-semibold">
              {t('ai.conversation.deleteName', {
                title: conversation.title ?? t('ai.conversation.untitled'),
              })}
            </span>
            <br />
            {t('ai.conversation.deleteWarning')}
          </DialogDescription>
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            isLoading={deleteAiConversation.isPending}
          >
            <Trash />
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
