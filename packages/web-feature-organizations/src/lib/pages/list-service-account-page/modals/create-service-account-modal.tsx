import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { CreatedServiceAccount, CreateServiceAccount } from '@skeleton/core-api-models';
import { useCreateServiceAccountForm } from '../hooks/use-create-service-account-form';
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

const FORM_ID = 'create-service-account-form';

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
      <DialogContent>
        {isSuccessState ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('serviceAccounts.create.createdTitle')}</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <ServiceAccountSecretReveal
                clientId={createdServiceAccount.clientId ?? ''}
                clientSecret={createdServiceAccount.clientSecret ?? ''}
              />
            </DialogBody>

            <DialogFooter>
              <Button size="lg" className="w-full" onClick={() => handleOpenChange(false)}>
                {t('common.done')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('serviceAccounts.create.title')}</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <FormProvider {...form}>
                <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <ControlledTextInput
                      name="name"
                      label={t('serviceAccounts.form.nameLabel')}
                      placeholder={t('serviceAccounts.form.namePlaceholder')}
                      direction="vertical"
                    />
                    <p className="body text-muted-foreground">
                      {t('serviceAccounts.form.nameHint')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="label">{t('serviceAccounts.form.permissionsLabel')}</span>
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
                      <p className="body text-destructive">
                        {tIfKey(form.formState.errors.permissions.message)}
                      </p>
                    )}
                  </div>

                  {form.formState.errors.root && (
                    <p className="body text-destructive">
                      {form.formState.errors.root.message}
                    </p>
                  )}
                </form>
              </FormProvider>
            </DialogBody>

            {/* Outside the form, so it stays in sight: submits it through `form`. */}
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                form={FORM_ID}
                isLoading={isLoading}
                disabled={!isCatalogReady}
              >
                {t('common.create')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
