import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { Organization, UpdateOrganization } from '@skeleton/core-api-models';
import { useUpdateOrganizationForm } from '../hooks/use-update-organization-form';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from '@skeleton/core-translations';

type UpdateOrganizationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization;
};

export const UpdateOrganizationModal = ({
  open,
  onOpenChange,
  organization,
}: UpdateOrganizationModalProps) => {
  const { t } = useTranslation();
  const { form, handleSubmit, isLoading } = useUpdateOrganizationForm({
    organization,
    onSuccess: () => onOpenChange(false),
  });

  const { ControlledTextInput } = createConnectedInputHelpers<UpdateOrganization>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('userWorkspaces.rename.title')}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ControlledTextInput
              direction="vertical"
              name="name"
              label={t('userWorkspaces.rename.nameLabel')}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {t('userWorkspaces.rename.submit')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
