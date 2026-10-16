import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@skeleton/web-components';
import { CreatedServiceAccount, CreateServiceAccount } from '@skeleton/core-api-models';
import { useCreateServiceAccountForm } from '../hooks/use-create-service-account-form';
import { X } from 'lucide-react';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { Controller, FormProvider } from 'react-hook-form';
import { useState } from 'react';
import { ServiceAccountSecretReveal } from '../components/service-account-secret-reveal';
import { ServiceAccountPermissionPicker } from '../components/service-account-permission-picker';
import { useTranslation } from '@skeleton/core-translations';

type CreateServiceAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
};

export const CreateServiceAccountModal = ({
  open,
  onOpenChange,
  organizationId,
}: CreateServiceAccountModalProps) => {
  const { t, tIfKey } = useTranslation();
  const [createdServiceAccount, setCreatedServiceAccount] =
    useState<CreatedServiceAccount | null>(null);

  const { form, handleSubmit, isLoading, isCatalogReady, isSuccess, reset } =
    useCreateServiceAccountForm({
      organizationId,
      onSuccess: (created) => setCreatedServiceAccount(created),
    });

  const { ControlledTextInput } = createConnectedInputHelpers<CreateServiceAccount>();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setCreatedServiceAccount(null);
    }
    onOpenChange(open);
  };

  const isSuccessState = isSuccess && createdServiceAccount;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-6 rounded-3xl p-8 shadow-lg sm:max-w-lg"
      >
        {isSuccessState ? (
          <>
            <div className="flex items-start gap-4">
              <DialogTitle className="flex-1 font-heading text-xl font-semibold tracking-tight text-foreground">
                {t('serviceAccounts.create.createdTitle')}
              </DialogTitle>
              <DialogClose className="shrink-0 opacity-70 transition-opacity hover:opacity-100">
                <X className="size-6" />
                <span className="sr-only">{t('common.close')}</span>
              </DialogClose>
            </div>

            <ServiceAccountSecretReveal
              clientId={createdServiceAccount.clientId ?? ''}
              clientSecret={createdServiceAccount.clientSecret ?? ''}
            />

            <Button size="lg" className="w-full" onClick={() => handleOpenChange(false)}>
              {t('common.done')}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <DialogTitle className="flex-1 font-heading text-xl font-semibold tracking-tight text-foreground">
                {t('serviceAccounts.create.title')}
              </DialogTitle>
              <DialogClose className="shrink-0 opacity-70 transition-opacity hover:opacity-100">
                <X className="size-6" />
                <span className="sr-only">{t('common.close')}</span>
              </DialogClose>
            </div>

            <FormProvider {...form}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <ControlledTextInput
                    name="name"
                    label={t('serviceAccounts.form.nameLabel')}
                    placeholder={t('serviceAccounts.form.namePlaceholder')}
                    direction="vertical"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('serviceAccounts.form.nameHint')}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    {t('serviceAccounts.form.permissionsLabel')}
                  </span>
                  <Controller
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                      <ServiceAccountPermissionPicker
                        organizationId={organizationId}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {form.formState.errors.permissions && (
                    <p className="text-sm text-destructive">
                      {tIfKey(form.formState.errors.permissions.message)}
                    </p>
                  )}
                </div>

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={!isCatalogReady}
                  >
                    {t('common.create')}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
