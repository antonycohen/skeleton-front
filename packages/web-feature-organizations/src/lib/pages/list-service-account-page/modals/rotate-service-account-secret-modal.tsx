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
import { CreatedServiceAccount, ServiceAccount } from '@skeleton/core-api-models';
import { useRotateServiceAccountSecret } from '@skeleton/core-api';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { RefreshCw, TriangleAlertIcon } from 'lucide-react';
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
      <DialogContent size="sm">
        {rotatedServiceAccount ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('serviceAccounts.rotate.generatedTitle')}</DialogTitle>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-4">
              <ServiceAccountSecretReveal
                clientId={rotatedServiceAccount.clientId ?? ''}
                clientSecret={rotatedServiceAccount.clientSecret ?? ''}
              />
            </DialogBody>
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
            <DialogBody className="flex flex-col gap-4">
              <Alert variant="warning">
                <TriangleAlertIcon />
                <AlertTitle>{t('serviceAccounts.accountName', { name: serviceAccount.name ?? '' })}</AlertTitle>
                <AlertDescription>
                  {t('serviceAccounts.rotate.warning')}
                </AlertDescription>
              </Alert>
            </DialogBody>
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
