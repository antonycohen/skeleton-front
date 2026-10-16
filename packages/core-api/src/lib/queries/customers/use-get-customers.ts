import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ReadCustomer } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getCustomers = async (
  params: GetCollectionQueryParams<ReadCustomer>,
): Promise<ApiCollectionResponse<ReadCustomer>> => {
  return await skeletonApi.customers.getCustomers(params);
};

export const useGetCustomers = (
  params: GetCollectionQueryParams<ReadCustomer>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadCustomer>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['customers', params],
    queryFn: () => getCustomers(params),
    ...options,
  });
