import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@skeleton/web-components';
import { OrganizationMember } from '@skeleton/core-api-models';
import { useRemoveOrganizationMember } from '@skeleton/core-api';
import { toast } from 'sonner';
import { Trash, TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

type RemoveMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  member: OrganizationMember;
};

export const RemoveMemberModal = ({
  open,
  onOpenChange,
  organizationId,
  member,
}: RemoveMemberModalProps) => {
  const { t } = useTranslation();
  const isInvited = member.status === 'invited';

  const removeMember = useRemoveOrganizationMember({
    onSuccess: () => {
      toast.success(isInvited ? t('teams.remove.invitationCancelled') : t('teams.remove.success'));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t('teams.remove.error'));
      // 409: last admin, or a member the directory manages. The row was stale and refreshes.
      if (error.httpCode === 409) onOpenChange(false);
    },
  });

  const handleRemove = () => {
    if (!member.id) return;
    removeMember.mutate({
      organizationId,
      memberId: member.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>
            {isInvited ? t('teams.remove.cancelInvitationTitle') : t('teams.actions.removeFromWorkspace')}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>{t('teams.memberEmail', { email: member.email })}</AlertTitle>
            <AlertDescription>
              {isInvited
                ? t('teams.remove.invitationWarning')
                : t('teams.remove.warning')}
            </AlertDescription>
          </Alert>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {isInvited ? t('teams.remove.keepInvitation') : t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            isLoading={removeMember.isPending}
          >
            <Trash className="size-4" />
            {isInvited ? t('teams.remove.cancelInvitation') : t('teams.remove.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
