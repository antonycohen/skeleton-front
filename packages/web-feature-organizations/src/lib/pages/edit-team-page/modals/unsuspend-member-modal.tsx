import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { OrganizationMember } from '@skeleton/core-api-models';
import { useUnsuspendOrganizationMember } from '@skeleton/core-api';
import { IconCircleCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type UnsuspendMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  member: OrganizationMember;
};

export const UnsuspendMemberModal = ({
  open,
  onOpenChange,
  organizationId,
  member,
}: UnsuspendMemberModalProps) => {
  const { t } = useTranslation();
  const unsuspendMember = useUnsuspendOrganizationMember({
    onSuccess: () => {
      toast.success(t('teams.unsuspend.success'));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t('teams.unsuspend.error'));
    },
  });

  const handleUnsuspend = () => {
    if (!member.id) return;
    unsuspendMember.mutate({
      organizationId,
      memberId: member.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('teams.actions.restoreAccess')}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-start rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="pt-0.5">
            <IconCircleCheck className="size-4 text-emerald-600" />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-emerald-700">
            <p className="text-sm font-medium">
              {t('teams.memberEmail', { email: member.email })}
            </p>
            <p className="text-sm">
              {t('teams.unsuspend.description')}
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
            onClick={handleUnsuspend}
            isLoading={unsuspendMember.isPending}
          >
            {t('teams.actions.restoreAccess')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
