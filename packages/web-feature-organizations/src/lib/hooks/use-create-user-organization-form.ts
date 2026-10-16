import {useForm} from 'react-hook-form';
import {CreateOrganization, createOrganizationSchema, Organization,} from '@skeleton/core-api-models';
import {zodResolver} from '@hookform/resolvers/zod';
import {useCreateUserOrganization} from "@skeleton/core-api";
import {handleApiError} from "@skeleton/web-form";

type UseCreateUserOrganizationFormOptions = {
  userId: string;
  onSuccess?: (organization: Organization) => void;
};

export const useCreateUserOrganizationForm = ({
  userId,
  onSuccess,
}: UseCreateUserOrganizationFormOptions) => {

  const form = useForm<CreateOrganization>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      type: "business"
    },
  });

  const createOrganization = useCreateUserOrganization({
    onSuccess: (organization) => {
      onSuccess?.(organization);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    createOrganization.mutate({
      userId,
      data,
    })
  });

  const reset = () => {
    form.reset();
  };

  return {
    form,
    handleSubmit,
    isLoading: createOrganization.isPending,
    isSuccess: createOrganization.isSuccess,
    reset,
  };
};
