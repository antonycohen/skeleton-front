import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateOrganization,
  createOrganizationSchema,
  Organization,
} from '@skeleton/core-api-models';
import { useCreateOrganization } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';

type UseCreateOrganizationManagerFormOptions = {
  onSuccess?: (organization: Organization) => void;
};

/** Staff-side creation of a workspace. */
export const useCreateOrganizationManagerForm = ({
  onSuccess,
}: UseCreateOrganizationManagerFormOptions) => {
  const form = useForm<CreateOrganization>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      type: 'business',
    },
  });

  const createOrganization = useCreateOrganization({
    onSuccess: (organization) => {
      form.reset();
      onSuccess?.(organization);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    createOrganization.mutate({ data });
  });

  return {
    form,
    handleSubmit,
    isLoading: createOrganization.isPending,
    reset: () => form.reset(),
  };
};
