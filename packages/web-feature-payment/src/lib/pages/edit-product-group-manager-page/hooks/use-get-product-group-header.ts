import { useGetAdminProductGroupById } from '@skeleton/core-api';

export const useGetProductGroupHeader = (productGroupId: string) => {
  const { data: productGroup, isLoading } = useGetAdminProductGroupById({
    id: productGroupId,
    fields: {
      id: null,
      name: null,
    },
  });

  return { productGroup, isLoading };
};
