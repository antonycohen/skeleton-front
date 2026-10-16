import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { CreateOrganization } from '@skeleton/core-api-models';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { useTranslation } from '@skeleton/core-translations';
import { useCreateOrganizationManagerForm } from '../hooks/use-create-organization-manager-form';

type CreateOrganizationManagerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateOrganizationManagerModal = ({
  open,
  onOpenChange,
}: CreateOrganizationManagerModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { form, handleSubmit, isLoading, reset } =
    useCreateOrganizationManagerForm({
      onSuccess: (organization) => {
        onOpenChange(false);
        if (organization.id) {
          navigate(`/workspaces/${organization.id}`);
        }
      },
    });

  const { ControlledTextInput, ControlledSelectInput } =
    createConnectedInputHelpers<CreateOrganization>();

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('adminOrganizations.create.title')}</DialogTitle>
          <DialogDescription>
            {t('adminOrganizations.create.description')}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ControlledTextInput
              direction="vertical"
              name="name"
              label={t('adminOrganizations.create.name')}
              placeholder={t('adminOrganizations.create.namePlaceholder')}
            />
            <ControlledSelectInput
              direction="vertical"
              name="type"
              label={t('adminOrganizations.create.type')}
              options={[
                { value: 'business', label: t('adminOrganizations.types.business') },
                { value: 'individual', label: t('adminOrganizations.types.individual') },
              ]}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
