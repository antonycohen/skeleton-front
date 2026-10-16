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

export type RemoveSsoDomainModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
  /** Removing it leaves the connection without a verified domain, so it stops letting people in. */
  isLastVerifiedOfActiveConnection: boolean;
  isRemoving?: boolean;
  onConfirm: () => void;
};

export const RemoveSsoDomainModal = ({
  open,
  onOpenChange,
  domain,
  isLastVerifiedOfActiveConnection,
  isRemoving,
  onConfirm,
}: RemoveSsoDomainModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('security.domains.removeTitle', { domain })}</DialogTitle>
          <DialogDescription>
            {t('security.domains.removeDescription')}
          </DialogDescription>
        </DialogHeader>

        {isLastVerifiedOfActiveConnection && (
          <Alert variant="important">
            <TriangleAlertIcon />
            <AlertDescription>
              {t('security.domains.removeLastWarning')}
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
            {t('security.domains.removeConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
