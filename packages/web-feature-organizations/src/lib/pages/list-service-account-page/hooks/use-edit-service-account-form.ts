import { useForm } from 'react-hook-form';
import {
  ServiceAccount,
  toShortPermission,
  UpdateServiceAccount,
  updateServiceAccountSchema,
} from '@skeleton/core-api-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateServiceAccount } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';

type UseEditServiceAccountFormOptions = {
  organizationId: string;
  serviceAccount: ServiceAccount;
  onSuccess?: (serviceAccount: ServiceAccount) => void;
};

export const useEditServiceAccountForm = ({
  organizationId,
  serviceAccount,
  onSuccess,
}: UseEditServiceAccountFormOptions) => {
  const form = useForm<UpdateServiceAccount>({
    resolver: zodResolver(updateServiceAccountSchema),
    defaultValues: {
      name: serviceAccount.name ?? '',
      permissions: (serviceAccount.permissions ?? []).map(toShortPermission),
    },
  });

  const updateServiceAccount = useUpdateServiceAccount({
    onSuccess: (updated) => {
      onSuccess?.(updated);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!serviceAccount.id) return;
    updateServiceAccount.mutate({
      organizationId,
      serviceAccountId: serviceAccount.id,
      data,
    });
  });

  return {
    form,
    handleSubmit,
    isLoading: updateServiceAccount.isPending,
  };
};
