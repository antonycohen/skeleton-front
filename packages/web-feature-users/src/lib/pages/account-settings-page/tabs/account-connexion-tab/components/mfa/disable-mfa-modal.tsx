import { FormProvider } from 'react-hook-form';
import { ReadUser } from '@skeleton/core-api-models';
import { useDisableMfa } from '@skeleton/core-api';
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

type DisableMfaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ReadUser;
};

export const DisableMfaModal = ({ open, onOpenChange, user }: DisableMfaModalProps) => {
  const { form, toRequest, allowCode } = useMfaFreshProofForm(user);
  const { t } = useTranslation();

  const disableMfa = useDisableMfa({
    onSuccess: () => {
      toast.success(t('account.mfa.disabledToast'));
      onOpenChange(false);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    disableMfa.mutate({ userId: user.id as string, data: toRequest(data) });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form id="disable-mfa-form" onSubmit={handleSubmit} className="contents">
          <FormProvider {...form}>
            <DialogHeader>
              <DialogTitle>{t('account.mfa.disableModal.title')}</DialogTitle>
              <DialogDescription>
                {t('account.mfa.disableModal.description')}
              </DialogDescription>
            </DialogHeader>

            <MfaFreshProofFields allowCode={allowCode} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                form="disable-mfa-form"
                variant="destructive"
                isLoading={disableMfa.isPending}
              >
                {t('account.mfa.disable')}
              </Button>
            </DialogFooter>
          </FormProvider>
        </form>
      </DialogContent>
    </Dialog>
  );
};
