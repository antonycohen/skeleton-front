import { GetQueryByIdParams } from '../../types';
import { ReadProductGroup } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getProductGroupById = async (
  params: GetQueryByIdParams<ReadProductGroup>,
): Promise<ReadProductGroup> => {
  return await skeletonApi.productGroups.getProductGroup(params);
};

export const useGetProductGroupById = (
  params: GetQueryByIdParams<ReadProductGroup>,
  options?: Omit<UseQueryOptions<ReadProductGroup, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['product-groups', params.id, params.fields],
    queryFn: () => getProductGroupById(params),
    ...options,
  });
