import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('adminUsers.resetMfa.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-start rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="pt-0.5">
            <TriangleAlertIcon className="size-4 text-destructive" />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-destructive">
            <p className="text-sm font-medium">
              {t('adminUsers.resetMfa.user', { user: user.email ?? user.id })}
            </p>
            <p className="text-sm">
              {t('adminUsers.resetMfa.warning')}
            </p>
          </div>
        </div>

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
