import {useForm} from 'react-hook-form';
import {ChangeEmailRequest, changeEmailRequestSchema, ReadUser,} from '@skeleton/core-api-models';
import {zodResolver} from '@hookform/resolvers/zod';
import {useChangeEmail} from "@skeleton/core-api";
import {handleApiError} from "@skeleton/web-form";
import {toast} from "sonner";
import {useTranslation} from "@skeleton/core-translations";

export const useChangeEmailForm = (user: ReadUser) => {
  const {t} = useTranslation();

  const form = useForm<ChangeEmailRequest>({
    resolver: zodResolver(changeEmailRequestSchema),
    defaultValues: {
      newEmail: '',
    },
    values: {
        newEmail: user.email ?? '',
      }
  });

  const changeEmail = useChangeEmail({
    onSuccess: () => {
      toast.success(t('account.email.updated'));
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    changeEmail.mutate({
      userId: user.id as string,
      data
    })
  });

  return { form, handleSubmit, isLoading: changeEmail.isPending };
};
