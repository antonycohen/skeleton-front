import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('security.certificates.removeTitle')}</DialogTitle>
          <DialogDescription>
            {t('security.certificates.removeDescription', { label })}
          </DialogDescription>
        </DialogHeader>

        {isLastValid && (
          <Alert variant="important">
            <TriangleAlertIcon />
            <AlertDescription>
              {t('security.certificates.removeLastWarning')}
            </AlertDescription>
          </Alert>
        )}

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
