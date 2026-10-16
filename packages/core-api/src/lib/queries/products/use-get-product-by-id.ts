import { GetQueryByIdParams } from '../../types';
import { ReadProduct } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getProductById = async (
  params: GetQueryByIdParams<ReadProduct>,
): Promise<ReadProduct> => {
  return await skeletonApi.products.getProduct(params);
};

export const useGetProductById = (
  params: GetQueryByIdParams<ReadProduct>,
  options?: Omit<UseQueryOptions<ReadProduct, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['products', params.id, params.fields],
    queryFn: () => getProductById(params),
    ...options,
  });
