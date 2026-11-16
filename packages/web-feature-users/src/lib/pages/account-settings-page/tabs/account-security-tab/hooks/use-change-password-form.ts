import {useForm} from 'react-hook-form';
import {ChangePasswordRequest, changePasswordRequestSchema, ReadUser,} from '@skeleton/core-api-models';
import {zodResolver} from '@hookform/resolvers/zod';
import {useChangePassword} from "@skeleton/core-api";
import {handleApiError} from "@skeleton/web-form";
import {toast} from "sonner";
import {useTranslation} from "@skeleton/core-translations";

export const useChangePasswordForm = (user: ReadUser) => {
  const {t} = useTranslation();
  const form = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordRequestSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      repeatNewPassword: '',
    },
  });

  const changePassword = useChangePassword({
    onSuccess: () => {
      toast.success(t('account.password.changed'));
      form.reset();
    },
    onError: (error) => handleApiError(error, form),
  });


  const handleSubmit = form.handleSubmit((data) => {
    changePassword.mutate({
      userId: user.id as string,
      data
    })
  });

  return {form, handleSubmit, isLoading: changePassword.isPending};
};
