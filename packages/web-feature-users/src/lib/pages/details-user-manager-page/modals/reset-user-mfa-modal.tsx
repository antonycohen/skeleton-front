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
import type { ReadUser } from '@skeleton/core-api-models';
import { useResetUserMfa } from '@skeleton/core-api';
import { TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type ResetUserMfaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ReadUser;
};

export const ResetUserMfaModal = ({ open, onOpenChange, user }: ResetUserMfaModalProps) => {
  const { t } = useTranslation();
  const resetMfa = useResetUserMfa({
    onSuccess: () => {
      toast.success(t('adminUsers.resetMfa.success'));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t('adminUsers.resetMfa.failure'));
    },
  });

  const handleReset = () => {
    if (!user.id) return;
    resetMfa.mutate({ userId: user.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('adminUsers.resetMfa.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>{t('adminUsers.resetMfa.user', { user: user.email ?? user.id })}</AlertTitle>
            <AlertDescription>{t('adminUsers.resetMfa.warning')}</AlertDescription>
          </Alert>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReset}
            isLoading={resetMfa.isPending}
          >
            {t('adminUsers.resetMfa.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
