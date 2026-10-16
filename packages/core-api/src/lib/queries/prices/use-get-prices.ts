import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ReadPrice } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetPricesFilter } from '../../endpoints/prices';

export const getPrices = async (
  params: GetCollectionQueryParams<ReadPrice, GetPricesFilter>,
): Promise<ApiCollectionResponse<ReadPrice>> => {
  return await skeletonApi.prices.getPrices(params);
};

export const useGetPrices = (
  params: GetCollectionQueryParams<ReadPrice, GetPricesFilter>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadPrice>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['prices', params],
    queryFn: () => getPrices(params),
    ...options,
  });
