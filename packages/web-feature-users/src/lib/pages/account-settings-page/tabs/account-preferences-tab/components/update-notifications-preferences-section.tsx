import {ReadUser, UpdateNotificationsPreferences} from '@skeleton/core-api-models';
import {Button, Card, CardContent, CardFooter, CardHeader, CardTitle,} from '@skeleton/web-components';
import {FormProvider} from 'react-hook-form';
import {useUpdateNotificationsPreferencesForm} from '../hooks/use-update-notifications-preferences-form';
import {createConnectedInputHelpers} from '@skeleton/web-form';
import {useTranslation} from '@skeleton/core-translations';

type UpdateNotificationsPreferencesSectionProps = {
  user: ReadUser;
};

const NOTIFICATION_OPTIONS = [
  {key: 'notificationsPreferences.channels.products' as const, i18nKey: 'account.preferences.notifications.products'},
  {key: 'notificationsPreferences.channels.news' as const, i18nKey: 'account.preferences.notifications.news'},
];

export const UpdateNotificationsPreferencesSection = ({
  user,
}: UpdateNotificationsPreferencesSectionProps) => {
  const {form, handleSubmit} = useUpdateNotificationsPreferencesForm(user);
  const {t} = useTranslation();

  const { ControlledSwitchInput } = createConnectedInputHelpers<UpdateNotificationsPreferences>()

  return (
    <FormProvider {...form}>
      <form
        id="update-notifications-preferences-form"
        onSubmit={handleSubmit}
      >
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">{t('account.preferences.notifications.title')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">

            <div className="flex flex-wrap gap-6 py-6">
              {NOTIFICATION_OPTIONS.map((option) => (
                <ControlledSwitchInput
                  key={option.key}
                  name={option.key}
                  label={t(option.i18nKey)}
                  inline
                />
              ))}
            </div>

          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button type="submit" form="update-notifications-preferences-form">
              {t('common.save')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};
