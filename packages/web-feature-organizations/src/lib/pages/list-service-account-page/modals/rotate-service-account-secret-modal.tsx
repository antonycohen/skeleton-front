import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { CreatedServiceAccount, ServiceAccount } from '@skeleton/core-api-models';
import { useRotateServiceAccountSecret } from '@skeleton/core-api';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ServiceAccountSecretReveal } from '../components/service-account-secret-reveal';

type RotateServiceAccountSecretModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  serviceAccount: ServiceAccount;
};

export const RotateServiceAccountSecretModal = ({
  open,
  onOpenChange,
  organizationId,
  serviceAccount,
}: RotateServiceAccountSecretModalProps) => {
  const { t } = useTranslation();
  const [rotatedServiceAccount, setRotatedServiceAccount] =
    useState<CreatedServiceAccount | null>(null);

  const rotateSecret = useRotateServiceAccountSecret({
    onSuccess: (rotated) => {
      setRotatedServiceAccount(rotated);
    },
    onError: (error) => {
      toast.error(error.message || t('serviceAccounts.rotate.failed'));
    },
  });

  const handleRotate = () => {
    if (!serviceAccount.id) return;
    rotateSecret.mutate({
      organizationId,
      serviceAccountId: serviceAccount.id,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRotatedServiceAccount(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {rotatedServiceAccount ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('serviceAccounts.rotate.generatedTitle')}</DialogTitle>
            </DialogHeader>

            <ServiceAccountSecretReveal
              clientId={rotatedServiceAccount.clientId ?? ''}
              clientSecret={rotatedServiceAccount.clientSecret ?? ''}
            />

            <DialogFooter>
              <Button
                type="button"
                className="w-full"
                onClick={() => handleOpenChange(false)}
              >
                {t('common.done')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('serviceAccounts.rotate.title')}</DialogTitle>
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
                  {t('serviceAccounts.rotate.warning')}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRotate}
                isLoading={rotateSecret.isPending}
              >
                <RefreshCw className="size-4" />
                {t('serviceAccounts.rotate.action')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
