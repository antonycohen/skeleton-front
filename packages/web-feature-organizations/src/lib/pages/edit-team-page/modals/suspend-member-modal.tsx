import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { OrganizationMember } from '@skeleton/core-api-models';
import { useSuspendOrganizationMember } from '@skeleton/core-api';
import { IconCircleCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type SuspendMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  member: OrganizationMember;
};

export const SuspendMemberModal = ({
  open,
  onOpenChange,
  organizationId,
  member,
}: SuspendMemberModalProps) => {
  const { t } = useTranslation();
  const suspendMember = useSuspendOrganizationMember({
    onSuccess: () => {
      toast.success(t('teams.suspend.success'));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t('teams.suspend.error'));
    },
  });

  const handleSuspend = () => {
    if (!member.id) return;
    suspendMember.mutate({
      organizationId,
      memberId: member.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('teams.actions.suspendAccess')}</DialogTitle>
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
              {t('teams.suspend.description')}
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
            onClick={handleSuspend}
            isLoading={suspendMember.isPending}
          >
            {t('teams.suspend.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
