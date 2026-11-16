import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { ServiceAccount, UpdateServiceAccount } from '@skeleton/core-api-models';
import { useEditServiceAccountForm } from '../hooks/use-edit-service-account-form';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { Controller, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { ServiceAccountPermissionPicker } from '../components/service-account-permission-picker';
import { useTranslation } from '@skeleton/core-translations';

type EditServiceAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  serviceAccount: ServiceAccount;
};

export const EditServiceAccountModal = ({
  open,
  onOpenChange,
  organizationId,
  serviceAccount,
}: EditServiceAccountModalProps) => {
  const { t, tIfKey } = useTranslation();
  const { form, handleSubmit, isLoading } = useEditServiceAccountForm({
    organizationId,
    serviceAccount,
    onSuccess: () => {
      toast.success(t('serviceAccounts.edit.updated'));
      onOpenChange(false);
    },
  });

  const { ControlledTextInput } = createConnectedInputHelpers<UpdateServiceAccount>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('serviceAccounts.edit.title')}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="contents">
            <DialogBody className="flex flex-col gap-6">
              <ControlledTextInput
                name="name"
                label={t('serviceAccounts.form.nameLabel')}
                placeholder={t('serviceAccounts.form.namePlaceholder')}
                direction="vertical"
              />

              <div className="flex flex-col gap-2">
                <span className="label">{t('serviceAccounts.form.permissionsLabel')}</span>
                <Controller
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <ServiceAccountPermissionPicker
                      organizationId={organizationId}
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
                {form.formState.errors.permissions && (
                  <p className="body text-destructive">
                    {tIfKey(form.formState.errors.permissions.message)}
                  </p>
                )}
                <p className="flex items-start gap-1.5 body text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  {t('serviceAccounts.edit.permissionsHint')}
                </p>
              </div>

              {form.formState.errors.root && (
                <p className="body text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
            </DialogBody>

            <DialogFooter className="flex-row justify-between sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
