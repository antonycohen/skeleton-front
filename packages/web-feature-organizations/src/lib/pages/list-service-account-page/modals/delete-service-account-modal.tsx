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
import { useDeleteServiceAccount } from '@skeleton/core-api';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { Trash, TriangleAlertIcon } from 'lucide-react';

type DeleteServiceAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  serviceAccount: ServiceAccount;
};

export const DeleteServiceAccountModal = ({
  open,
  onOpenChange,
  organizationId,
  serviceAccount,
}: DeleteServiceAccountModalProps) => {
  const { t } = useTranslation();
  const deleteServiceAccount = useDeleteServiceAccount({
    onSuccess: () => {
      toast.success(t('serviceAccounts.delete.success'));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t('serviceAccounts.delete.failed'));
    },
  });

  const handleDelete = () => {
    if (!serviceAccount.id) return;
    deleteServiceAccount.mutate({
      organizationId,
      serviceAccountId: serviceAccount.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('serviceAccounts.delete.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>{t('serviceAccounts.accountName', { name: serviceAccount.name ?? '' })}</AlertTitle>
            <AlertDescription>
              {t('serviceAccounts.delete.warning')}
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
            onClick={handleDelete}
            isLoading={deleteServiceAccount.isPending}
          >
            <Trash className="size-4" />
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
