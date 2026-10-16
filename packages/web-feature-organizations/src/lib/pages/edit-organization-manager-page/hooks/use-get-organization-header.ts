import { useGetOrganizationById } from '@skeleton/core-api';

export const useGetOrganizationHeader = (organizationId: string) => {
  const { data: organization, isLoading } = useGetOrganizationById({
    id: organizationId,
    fields: {
      id: null,
      name: null,
    },
  });

  return { organization, isLoading };
};
