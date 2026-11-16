import { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@skeleton/web-components';
import { Organization } from '@skeleton/core-api-models';
import { useDeleteOrganizationForm } from '../hooks/use-delete-organization-form';
import { FormProvider } from 'react-hook-form';
import { CircleAlertIcon, Trash } from 'lucide-react';
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
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('userWorkspaces.delete.title')}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="contents">
            <DialogBody className="flex flex-col gap-4">
              {/* Destructive, not the warning of other confirmations: it wipes a whole workspace. */}
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>{t('userWorkspaces.delete.warningTitle')}</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>{t('userWorkspaces.delete.allData')}</li>
                    <li>
                      {t('userWorkspaces.delete.membersAccess', { count: membersCount })}
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Subscription notice */}
              <div className="flex gap-3 items-start rounded-lg border px-4 py-3">
                <div className="flex flex-col gap-1 flex-1">
                  <p className="label">
                    {tNode('userWorkspaces.delete.subscriptionCanceled', {
                      name: organization.name ?? '',
                      strong: (chunks: ReactNode) => (
                        <span className="font-medium">{chunks}</span>
                      ),
                    })}
                  </p>
                  <div className="body text-muted-foreground">
                    <p>{t('userWorkspaces.delete.canceledAtRenewal')}</p>
                    <p>{t('userWorkspaces.delete.gracePeriod', { days: 14 })}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label">
                  {t('userWorkspaces.delete.confirmationLabel', { word: 'DELETE' })}
                </label>
                <Input
                  {...form.register('confirmation')}
                  placeholder=""
                  autoComplete="off"
                />
              </div>
            </DialogBody>
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
