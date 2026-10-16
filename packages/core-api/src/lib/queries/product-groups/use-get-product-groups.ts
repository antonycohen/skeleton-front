import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ReadProductGroup } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getProductGroups = async (
  params: GetCollectionQueryParams<ReadProductGroup>,
): Promise<ApiCollectionResponse<ReadProductGroup>> => {
  return await skeletonApi.productGroups.getProductGroups(params);
};

export const useGetProductGroups = (
  params: GetCollectionQueryParams<ReadProductGroup>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadProductGroup>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['product-groups', params],
    queryFn: () => getProductGroups(params),
    ...options,
  });
