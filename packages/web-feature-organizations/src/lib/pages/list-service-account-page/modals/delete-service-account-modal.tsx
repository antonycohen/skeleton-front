import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { ServiceAccount } from '@skeleton/core-api-models';
import { useDeleteServiceAccount } from '@skeleton/core-api';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { Trash } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('serviceAccounts.delete.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-start rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="pt-0.5">
            <IconAlertTriangle className="size-4 text-destructive" />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-destructive">
            <p className="text-sm font-medium">
              {t('serviceAccounts.accountName', { name: serviceAccount.name ?? '' })}
            </p>
            <p className="text-sm">
              {t('serviceAccounts.delete.warning')}
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
