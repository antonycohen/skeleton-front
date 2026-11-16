import { TriangleAlertIcon } from 'lucide-react';
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
import { useSuspendOrganizationMember } from '@skeleton/core-api';
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
      // 409: last admin, or a member the directory manages. The row was stale and refreshes.
      if (error.httpCode === 409) onOpenChange(false);
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
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('teams.actions.suspendAccess')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>{t('teams.memberEmail', { email: member.email })}</AlertTitle>
            <AlertDescription>
              {t('teams.suspend.description')}
            </AlertDescription>
          </Alert>
        </DialogBody>
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
