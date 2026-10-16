import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { MfaEnrolment, MfaRecoveryCodes, ReadUser } from '@skeleton/core-api-models';
import {
  Button,
  CopyButton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';
import { useActivateMfaForm } from '../../hooks/use-activate-mfa-form';
import { MfaCodeInput } from './mfa-code-input';
import { RecoveryCodesList } from './recovery-codes-list';

type EnableMfaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ReadUser;
  /** The pending enrolment, obtained by the caller before opening (the secret is returned once). */
  enrolment: MfaEnrolment;
};

/**
 * Two steps: scan the QR code and confirm with the first code, then save the recovery codes.
 * Closing during the first step leaves the enrolment pending but harmless: MFA is not active
 * until a code is confirmed, and the next setup simply replaces it.
 */
export const EnableMfaModal = ({ open, onOpenChange, user, enrolment }: EnableMfaModalProps) => {
  const [recoveryCodes, setRecoveryCodes] = useState<MfaRecoveryCodes | null>(null);
  const { form, handleSubmit, isLoading } = useActivateMfaForm(user, setRecoveryCodes);
  const { t, tIfKey } = useTranslation();
  const rootError = form.formState.errors.root?.message;

  if (recoveryCodes) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('account.mfa.enableModal.doneTitle')}</DialogTitle>
            <DialogDescription>
              {t('account.mfa.enableModal.doneDescription')}
            </DialogDescription>
          </DialogHeader>
          <RecoveryCodesList codes={recoveryCodes.recoveryCodes} accountEmail={user.email} />
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              {t('account.mfa.savedRecoveryCodes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form id="enable-mfa-form" onSubmit={handleSubmit} className="contents">
          <FormProvider {...form}>
            <DialogHeader>
              <DialogTitle>{t('account.mfa.enableModal.title')}</DialogTitle>
              <DialogDescription>
                {t('account.mfa.enableModal.description')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <img
                src={enrolment.qrCodeDataUrl}
                alt={t('account.mfa.enableModal.qrCodeAlt')}
                width={176}
                height={176}
                className="size-44 shrink-0 self-center rounded-lg border bg-white p-2"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{t('account.mfa.enableModal.cantScan')}</span>
                  <span className="text-sm text-muted-foreground">
                    {t('account.mfa.enableModal.enterKeyByHand')}
                  </span>
                  <div className="flex items-center gap-1 rounded-md border bg-muted/40 pl-3">
                    <code className="min-w-0 flex-1 break-all py-2 font-mono text-xs tracking-wider select-all">
                      {enrolment.secret}
                    </code>
                    <CopyButton value={enrolment.secret} toastMessage={t('account.mfa.enableModal.keyCopied')} />
                  </div>
                </div>
                <MfaCodeInput name="code" label={t('account.mfa.enableModal.codeLabel')} autoFocus />
                {rootError && (
                  <p role="alert" className="text-sm text-destructive">
                    {tIfKey(rootError)}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" form="enable-mfa-form" isLoading={isLoading}>
                {t('account.mfa.enableModal.activate')}
              </Button>
            </DialogFooter>
          </FormProvider>
        </form>
      </DialogContent>
    </Dialog>
  );
};
