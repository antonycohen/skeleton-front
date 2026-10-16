import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ReadProduct } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getProducts = async (
  params: GetCollectionQueryParams<ReadProduct>,
): Promise<ApiCollectionResponse<ReadProduct>> => {
  return await skeletonApi.products.getProducts(params);
};

export const useGetProducts = (
  params: GetCollectionQueryParams<ReadProduct>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadProduct>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    ...options,
  });
