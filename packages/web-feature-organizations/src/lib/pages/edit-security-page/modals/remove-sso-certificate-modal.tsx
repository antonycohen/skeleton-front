import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

export type RemoveSsoCertificateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What identifies the certificate to the admin: its subject, or its fingerprint. */
  label: string;
  /** No other valid certificate would be left, which the API treats as a change of trust. */
  isLastValid: boolean;
  isRemoving?: boolean;
  onConfirm: () => void;
};

export const RemoveSsoCertificateModal = ({
  open,
  onOpenChange,
  label,
  isLastValid,
  isRemoving,
  onConfirm,
}: RemoveSsoCertificateModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('security.certificates.removeTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <DialogDescription className="text-foreground">
            {t('security.certificates.removeDescription', { label })}
          </DialogDescription>
          {isLastValid && (
            <Alert variant="warning">
              <TriangleAlertIcon />
              <AlertDescription>
                {t('security.certificates.removeLastWarning')}
              </AlertDescription>
            </Alert>
          )}
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
            onClick={onConfirm}
            isLoading={isRemoving}
          >
            {t('security.certificates.removeConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
