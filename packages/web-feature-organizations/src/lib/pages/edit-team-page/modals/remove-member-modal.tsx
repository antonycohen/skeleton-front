import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { OrganizationMember } from '@skeleton/core-api-models';
import { useRemoveOrganizationMember } from '@skeleton/core-api';
import { IconCircleCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isInvited ? t('teams.remove.cancelInvitationTitle') : t('teams.actions.removeFromWorkspace')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-start rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="pt-0.5">
            <IconCircleCheck className="size-4 text-destructive" />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-destructive">
            <p className="text-sm font-medium">
              {t('teams.memberEmail', { email: member.email })}
            </p>
            <p className="text-sm">
              {isInvited
                ? t('teams.remove.invitationWarning')
                : t('teams.remove.warning')}
            </p>
          </div>
        </div>

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
