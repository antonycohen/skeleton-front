import { InfoIcon } from 'lucide-react';
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
import { useUnsuspendOrganizationMember } from '@skeleton/core-api';
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
      // 409: last admin, or a member the directory manages. The row was stale and refreshes.
      if (error.httpCode === 409) onOpenChange(false);
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
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('teams.actions.restoreAccess')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Alert>
            <InfoIcon />
            <AlertTitle>{t('teams.memberEmail', { email: member.email })}</AlertTitle>
            <AlertDescription>
              {t('teams.unsuspend.description')}
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
