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
import { ServiceAccount } from '@skeleton/core-api-models';
import { useDisableServiceAccount } from '@skeleton/core-api';
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
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('serviceAccounts.disable.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>{t('serviceAccounts.accountName', { name: serviceAccount.name ?? '' })}</AlertTitle>
            <AlertDescription>
              {t('serviceAccounts.disable.warning')}
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
