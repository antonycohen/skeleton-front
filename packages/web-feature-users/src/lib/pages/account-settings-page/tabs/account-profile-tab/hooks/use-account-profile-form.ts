import {useForm} from 'react-hook-form';
import {ReadUser, UpdateUserInfo, updateUserInfoSchema,} from '@skeleton/core-api-models';
import {zodResolver} from '@hookform/resolvers/zod';
import {useDeleteUser, useUpdateUser} from "@skeleton/core-api";
import {handleApiError} from "@skeleton/web-form";
import {toast} from "sonner";
import {useTranslation} from "@skeleton/core-translations";

export const useAccountProfileForm = (user?: ReadUser) => {
  const {t} = useTranslation();
  const form = useForm<UpdateUserInfo>({
    resolver: zodResolver(updateUserInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      profileImage: null,
    },
    values: user
      ? {
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        profileImage: user.profileImage
      }
      : undefined,
  });

  const updateUser = useUpdateUser({
    onSuccess: () => {
      toast.success(t('account.profile.updated'));
    },
    onError: (error) => handleApiError(error, form),
  });

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      toast.success(t('account.deleteAccount.deleted'));
    },
    onError: (error) => handleApiError(error, form),
  })

  const handleDeleteAccount = () => {
    if (!user) return;
    deleteUser.mutate({ userId: user.id as string });
  }


  const handleSubmit = form.handleSubmit((data: UpdateUserInfo) => {
    if (!user) return;
    updateUser.mutate({
      userId: user.id as string,
      data,
    })
  });

  return { form, handleSubmit, handleDeleteAccount, isUpdating: updateUser.isPending, isDeleting: deleteUser.isPending };
};
