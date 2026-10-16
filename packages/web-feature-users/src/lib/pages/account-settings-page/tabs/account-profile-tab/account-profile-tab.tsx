import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EditUserOutletContext } from '../../types';
import { FormProvider } from 'react-hook-form';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@skeleton/web-components';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { UpdateUserInfo } from '@skeleton/core-api-models';
import { useTranslation } from '@skeleton/core-translations';
import { useAccountProfileForm } from './hooks/use-account-profile-form';
import { DeleteAccountConfirmationAlertDialog } from './modals/delete-account-confirmation-alert-dialog';

export const AccountProfileTab = () => {
  const { user, isLoading } = useOutletContext<EditUserOutletContext>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { t } = useTranslation();

  const { form, handleSubmit, handleDeleteAccount, isDeleting, isUpdating } =
    useAccountProfileForm(user);

  const { ControlledTextInput, ControlledImageInput } =
    createConnectedInputHelpers<UpdateUserInfo>();

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-8">
        {/* Profile Card */}
        <form onSubmit={handleSubmit}>
          <Card className="rounded-2xl gap-0">
            <CardHeader>
              <CardTitle className="text-xl">{t('account.profile.title')}</CardTitle>
              <CardDescription>
                {t('account.profile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-2">
              <div className="flex flex-col divide-y">
                <ControlledTextInput
                  name="firstName"
                  label={t('account.profile.firstName')}
                  direction="horizontal"
                  className="py-6"
                />
                <ControlledTextInput
                  name="lastName"
                  label={t('account.profile.lastName')}
                  direction="horizontal"
                  className="py-6"
                />
                <ControlledImageInput
                  name="profileImage"
                  label={t('account.profile.picture')}
                  direction="horizontal"
                  className="py-6"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t justify-end">
              <Button type="submit" isLoading={isUpdating}>{t('common.save')}</Button>
            </CardFooter>
          </Card>
        </form>

        {/* Delete Account Card */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl">{t('account.deleteAccount.title')}</CardTitle>
            <CardDescription>
              {t('account.deleteAccount.description')}
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-t justify-between">
            <p className="text-sm text-destructive">
              {t('account.deleteAccount.warning')}
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              {t('account.deleteAccount.title')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <DeleteAccountConfirmationAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
    </FormProvider>
  );
};
