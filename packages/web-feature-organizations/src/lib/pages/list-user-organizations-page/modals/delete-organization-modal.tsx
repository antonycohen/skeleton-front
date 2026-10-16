import { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@skeleton/web-components';
import { Organization } from '@skeleton/core-api-models';
import { useDeleteOrganizationForm } from '../hooks/use-delete-organization-form';
import { FormProvider } from 'react-hook-form';
import { IconCircleCheck } from '@tabler/icons-react';
import { Trash } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

type DeleteOrganizationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization;
};

export const DeleteOrganizationModal = ({
  open,
  onOpenChange,
  organization,
}: DeleteOrganizationModalProps) => {
  const { t, tNode } = useTranslation();
  const { form, handleSubmit, isLoading, isConfirmationValid } = useDeleteOrganizationForm({
    organization,
    onSuccess: () => onOpenChange(false),
  });

  const membersCount = organization.statistics?.activeMembersCount ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('userWorkspaces.delete.title')}</DialogTitle>
        </DialogHeader>

        {/* Destructive warning */}
        <div className="flex gap-3 items-start rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="pt-0.5">
            <IconCircleCheck className="size-4 text-destructive" />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-destructive">
            <p className="text-sm font-medium">
              {t('userWorkspaces.delete.warningTitle')}
            </p>
            <ul className="text-sm list-disc ml-5 space-y-1">
              <li>{t('userWorkspaces.delete.allData')}</li>
              <li>
                {t('userWorkspaces.delete.membersAccess', { count: membersCount })}
              </li>
            </ul>
          </div>
        </div>

        {/* Subscription notice */}
        <div className="flex gap-3 items-start rounded-lg border px-4 py-3">
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-sm font-medium">
              {tNode('userWorkspaces.delete.subscriptionCanceled', {
                name: organization.name ?? '',
                strong: (chunks: ReactNode) => (
                  <span className="font-medium">{chunks}</span>
                ),
              })}
            </p>
            <div className="text-sm text-muted-foreground">
              <p>{t('userWorkspaces.delete.canceledAtRenewal')}</p>
              <p>{t('userWorkspaces.delete.gracePeriod', { days: 14 })}</p>
            </div>
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {t('userWorkspaces.delete.confirmationLabel', { word: 'DELETE' })}
              </label>
              <Input
                {...form.register('confirmation')}
                placeholder=""
                autoComplete="off"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                isLoading={isLoading}
                disabled={!isConfirmationValid}
              >
                {t('userWorkspaces.delete.submit')}
                <Trash className="size-4 ml-2" />
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
