import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  CreatedServiceAccount,
  CreateServiceAccount,
  createServiceAccountSchema,
  flattenServiceAccountPermissionCatalog,
} from '@skeleton/core-api-models';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCreateServiceAccount,
  useGetServiceAccountPermissionCatalog,
} from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';

type UseCreateServiceAccountFormOptions = {
  organizationId: string;
  onSuccess?: (createdServiceAccount: CreatedServiceAccount) => void;
};

export const useCreateServiceAccountForm = ({
  organizationId,
  onSuccess,
}: UseCreateServiceAccountFormOptions) => {
  const form = useForm<CreateServiceAccount>({
    resolver: zodResolver(createServiceAccountSchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  });

  const { data: permissionCatalog } = useGetServiceAccountPermissionCatalog({
    organizationId,
  });

  // Pre-select the full catalog once it arrives, unless the user already
  // touched the selection.
  useEffect(() => {
    if (permissionCatalog && !form.formState.dirtyFields.permissions) {
      form.setValue(
        'permissions',
        flattenServiceAccountPermissionCatalog(permissionCatalog),
      );
    }
  }, [permissionCatalog, form]);

  const createServiceAccount = useCreateServiceAccount({
    onSuccess: (createdServiceAccount) => {
      onSuccess?.(createdServiceAccount);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    createServiceAccount.mutate({
      organizationId,
      data,
    });
  });

  const reset = () => {
    form.reset();
  };

  return {
    form,
    handleSubmit,
    isLoading: createServiceAccount.isPending,
    // Submit must stay disabled until the catalog is available (still loading
    // OR failed): submitting without it would send an empty permission list.
    isCatalogReady: !!permissionCatalog,
    isSuccess: createServiceAccount.isSuccess,
    reset,
  };
};
