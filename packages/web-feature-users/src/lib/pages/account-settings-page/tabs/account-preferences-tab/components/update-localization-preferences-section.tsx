import {ReadUser, UpdateLocalizationPreferences} from '@skeleton/core-api-models';
import {Button, Card, CardContent, CardFooter, CardHeader, CardTitle} from '@skeleton/web-components';
import {FormProvider} from 'react-hook-form';
import {createConnectedInputHelpers} from '@skeleton/web-form';
import {useTranslation} from '@skeleton/core-translations';
import {useUpdateLocalizationPreferencesForm} from '../hooks/use-update-localization-preferences-form';

type UpdateLocalizationPreferencesSectionProps = {
  user: ReadUser;
};

const DATE_FORMAT_OPTIONS = [
  {value: 'DD/MM/YYYY', label: '21/12/2025'},
  {value: 'MM/DD/YYYY', label: '12/21/2025'},
];


const {ControlledLanguageInput, ControlledRadioGroupInput} =
  createConnectedInputHelpers<UpdateLocalizationPreferences>();

export const UpdateLocalizationPreferencesSection = ({
  user,
}: UpdateLocalizationPreferencesSectionProps) => {
  const {form, handleSubmit} = useUpdateLocalizationPreferencesForm(user);
  const {t} = useTranslation();

  const languageOptions = [
    {iso2: 'en', label: t('common.language.en'), flag: '🇬🇧'},
    {iso2: 'fr', label: t('common.language.fr'), flag: '🇫🇷'},
  ];

  return (
    <FormProvider {...form}>
      <form id="update-localization-preferences-form" onSubmit={handleSubmit}>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-heading text-xl tracking-[-0.3px]">
              {t('account.preferences.display.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col">
              <ControlledLanguageInput
                name="localizationPreferences.language"
                label={t('account.preferences.display.language')}
                languages={languageOptions}
                direction="horizontal"
                className="py-6"
              />
              <ControlledRadioGroupInput
                name="localizationPreferences.dateFormat"
                label={t('account.preferences.display.dateFormat')}
                options={DATE_FORMAT_OPTIONS}
                direction="horizontal"
                className="py-6"
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button type="submit" form="update-localization-preferences-form">
              {t('common.save')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};
