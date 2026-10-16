import { ReactNode, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
} from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';

type DeleteAccountConfirmationAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

// What the person types to confirm: a fixed token, not translated
const CONFIRMATION_TEXT = 'DELETE';

export const DeleteAccountConfirmationAlertDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteAccountConfirmationAlertDialogProps) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const { t, tNode } = useTranslation();

  const isConfirmationValid = confirmationInput === CONFIRMATION_TEXT;

  const handleConfirm = () => {
    if (isConfirmationValid) {
      onConfirm();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmationInput('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="text-destructive">{t('account.deleteAccount.dialog.title')}</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>{t('account.deleteAccount.dialog.intro')}</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{t('account.deleteAccount.dialog.removeData')}</li>
                <li>{t('account.deleteAccount.dialog.cannotBeUndone')}</li>
              </ul>
              <div className="pt-2">
                <p className="mb-2">
                  {tNode('account.deleteAccount.dialog.typeToConfirm', {
                    text: CONFIRMATION_TEXT,
                    b: (chunks: ReactNode) => <span className="font-semibold">{chunks}</span>,
                  })}
                </p>
                <Input
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder={CONFIRMATION_TEXT}
                  autoComplete="off"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isLoading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isLoading ? t('account.deleteAccount.dialog.deleting') : t('common.continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
