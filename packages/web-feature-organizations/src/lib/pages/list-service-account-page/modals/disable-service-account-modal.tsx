import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { ServiceAccount } from '@skeleton/core-api-models';
import { useDisableServiceAccount } from '@skeleton/core-api';
import { IconBan } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type DisableServiceAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  serviceAccount: ServiceAccount;
};

export const DisableServiceAccountModal = ({
  open,
  onOpenChange,
  organizationId,
  serviceAccount,
}: DisableServiceAccountModalProps) => {
  const { t } = useTranslation();
  const disableServiceAccount = useDisableServiceAccount({
    onSuccess: () => {
      toast.success(t('serviceAccounts.disable.success'));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t('serviceAccounts.disable.failed'));
    },
  });

  const handleDisable = () => {
    if (!serviceAccount.id) return;
    disableServiceAccount.mutate({
      organizationId,
      serviceAccountId: serviceAccount.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('serviceAccounts.disable.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-start rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="pt-0.5">
            <IconBan className="size-4 text-destructive" />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-destructive">
            <p className="text-sm font-medium">
              {t('serviceAccounts.accountName', { name: serviceAccount.name ?? '' })}
            </p>
            <p className="text-sm">
              {t('serviceAccounts.disable.warning')}
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
            onClick={handleDisable}
            isLoading={disableServiceAccount.isPending}
          >
            {t('serviceAccounts.disable.action')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
