import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { MfaRecoveryCodes, ReadUser } from '@skeleton/core-api-models';
import { useRegenerateMfaRecoveryCodes } from '@skeleton/core-api';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { useMfaFreshProofForm } from '../../hooks/use-mfa-fresh-proof-form';
import { MfaFreshProofFields } from './mfa-fresh-proof-fields';
import { RecoveryCodesList } from './recovery-codes-list';

type RegenerateRecoveryCodesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ReadUser;
};

/** Fresh proof first, then the new codes. The old ones are void as soon as the API answers. */
export const RegenerateRecoveryCodesModal = ({ open, onOpenChange, user }: RegenerateRecoveryCodesModalProps) => {
  const [recoveryCodes, setRecoveryCodes] = useState<MfaRecoveryCodes | null>(null);
  const { form, toRequest, allowCode } = useMfaFreshProofForm(user);
  const { t } = useTranslation();

  const regenerate = useRegenerateMfaRecoveryCodes({
    onSuccess: (codes) => {
      toast.success(t('account.mfa.regenerateModal.generatedToast'));
      setRecoveryCodes(codes);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    regenerate.mutate({ userId: user.id as string, data: toRequest(data) });
  });

  if (recoveryCodes) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('account.mfa.regenerateModal.doneTitle')}</DialogTitle>
            <DialogDescription>{t('account.mfa.regenerateModal.doneDescription')}</DialogDescription>
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
      <DialogContent className="sm:max-w-md">
        <form id="regenerate-recovery-codes-form" onSubmit={handleSubmit} className="contents">
          <FormProvider {...form}>
            <DialogHeader>
              <DialogTitle>{t('account.mfa.regenerateModal.title')}</DialogTitle>
              <DialogDescription>
                {t('account.mfa.regenerateModal.description')}
              </DialogDescription>
            </DialogHeader>

            <MfaFreshProofFields allowCode={allowCode} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" form="regenerate-recovery-codes-form" isLoading={regenerate.isPending}>
                {t('account.mfa.regenerateModal.submit')}
              </Button>
            </DialogFooter>
          </FormProvider>
        </form>
      </DialogContent>
    </Dialog>
  );
};
