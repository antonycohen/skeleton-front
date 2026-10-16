import {ChangePasswordRequest, ReadUser} from '@skeleton/core-api-models';
import {Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@skeleton/web-components';
import {FormProvider} from 'react-hook-form';
import {createConnectedInputHelpers} from '@skeleton/web-form';
import {useTranslation} from '@skeleton/core-translations';
import {useChangePasswordForm} from '../hooks/use-change-password-form';

const {ControlledPasswordInput} = createConnectedInputHelpers<ChangePasswordRequest>();

type ChangePasswordSectionProps = {
  user: ReadUser;
};

export const ChangePasswordSection = ({user}: ChangePasswordSectionProps) => {
  const {form, handleSubmit, isLoading} = useChangePasswordForm(user);
  const {t} = useTranslation();

  return (
    <form id="change-password-form" onSubmit={handleSubmit} className="flex flex-col">
      <FormProvider {...form}>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">{t('account.password.title')}</CardTitle>
            <CardDescription>
              {t('account.password.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>

            <ControlledPasswordInput
              name="currentPassword"
              label={t('account.password.current')}
              direction="horizontal"
              className="py-6"
            />
            <ControlledPasswordInput
              name="newPassword"
              label={t('account.password.new')}
              direction="horizontal"
              className="py-6 border-t"
            />
            <ControlledPasswordInput
              name="repeatNewPassword"
              label={t('account.password.repeat')}
              direction="horizontal"
              className="py-6 border-t"
            />
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button type="submit" form="change-password-form" isLoading={isLoading}>
              {t('common.save')}
            </Button>
          </CardFooter>
        </Card>
      </FormProvider>
    </form>
  );
};
