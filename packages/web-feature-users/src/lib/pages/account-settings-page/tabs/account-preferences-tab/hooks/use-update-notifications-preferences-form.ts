import {useForm} from 'react-hook-form';
import {
  ReadUser,
  UpdateNotificationsPreferences,
  updateNotificationsPreferencesSchema,
} from '@skeleton/core-api-models';
import {zodResolver} from '@hookform/resolvers/zod';
import {useUpdateUser} from "@skeleton/core-api";
import {handleApiError} from "@skeleton/web-form";
import {toast} from "sonner";
import {useTranslation} from "@skeleton/core-translations";

export const useUpdateNotificationsPreferencesForm = (user: ReadUser) => {
  const {t} = useTranslation();
  const form = useForm<UpdateNotificationsPreferences>({
    resolver: zodResolver(updateNotificationsPreferencesSchema),
    defaultValues: {
      notificationsPreferences: {
        channels: {
          products: false,
          news: false,
        },
      }
    },
    values: {
      notificationsPreferences: {
        channels: {
          products: user.notificationsPreferences?.channels?.products ?? false,
          news: user.notificationsPreferences?.channels?.news ?? false,
        },
      }
    }
  });

  const updateNotificationPreferences = useUpdateUser({
    onSuccess: () => {
      toast.success(t('account.preferences.notificationsUpdated'));
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    console.log("data", data);
    updateNotificationPreferences.mutate({
      userId: user.id as string,
      data
    })
  });

  return { form, handleSubmit };
};
