import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { ServiceAccount } from '@skeleton/core-api-models';
import { useEnableServiceAccount } from '@skeleton/core-api';
import { IconCircleCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type EnableServiceAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  serviceAccount: ServiceAccount;
};

export const EnableServiceAccountModal = ({
  open,
  onOpenChange,
  organizationId,
  serviceAccount,
}: EnableServiceAccountModalProps) => {
  const { t } = useTranslation();
  const enableServiceAccount = useEnableServiceAccount({
    onSuccess: () => {
      toast.success(t('serviceAccounts.enable.success'));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t('serviceAccounts.enable.failed'));
    },
  });

  const handleEnable = () => {
    if (!serviceAccount.id) return;
    enableServiceAccount.mutate({
      organizationId,
      serviceAccountId: serviceAccount.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('serviceAccounts.enable.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-start rounded-lg border border-neutral-200 bg-muted px-4 py-3">
          <div className="pt-0.5">
            <IconCircleCheck className="size-4" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-sm font-medium">
              {t('serviceAccounts.accountName', { name: serviceAccount.name ?? '' })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('serviceAccounts.enable.warning')}
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
            onClick={handleEnable}
            isLoading={enableServiceAccount.isPending}
          >
            {t('serviceAccounts.enable.action')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
