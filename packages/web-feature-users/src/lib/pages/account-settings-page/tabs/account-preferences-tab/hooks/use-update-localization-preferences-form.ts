import {useForm} from 'react-hook-form';
import {ReadUser, UpdateLocalizationPreferences, updateLocalizationPreferencesSchema,} from '@skeleton/core-api-models';
import {zodResolver} from '@hookform/resolvers/zod';
import {useUpdateUser} from "@skeleton/core-api";
import {handleApiError} from "@skeleton/web-form";
import {toast} from "sonner";
import {useSelectLanguage, useTranslation} from "@skeleton/core-translations";

export const useUpdateLocalizationPreferencesForm = (user: ReadUser) => {
  const {t} = useTranslation();
  const selectLanguage = useSelectLanguage();
  const form = useForm<UpdateLocalizationPreferences>({
    resolver: zodResolver(updateLocalizationPreferencesSchema),
    defaultValues: {
      localizationPreferences: {
        language: null,
        dateFormat: null,
      }
    },
    values: {
      localizationPreferences: {
        language: user.localizationPreferences?.language ?? 'en',
        dateFormat: user.localizationPreferences?.dateFormat ?? 'dd/mm/yyyy',
        timezone: null,
      }
    }
  });

  const updateLocalizationPreferences = useUpdateUser({
    onSuccess: () => {
      const language = form.getValues('localizationPreferences.language');
      if (language) {
        // Switch the UI right away instead of waiting for the next session load
        selectLanguage(language);
      }
      toast.success(t('account.preferences.localizationUpdated'));
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    updateLocalizationPreferences.mutate({
      userId: user.id as string,
      data
    })
  });

  return { form, handleSubmit };
};
