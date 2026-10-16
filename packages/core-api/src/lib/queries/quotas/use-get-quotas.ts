import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ReadQuota } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetQuotasFilter } from '../../endpoints/quotas';

export const getQuotas = async (
  params: GetCollectionQueryParams<ReadQuota, GetQuotasFilter>,
): Promise<ApiCollectionResponse<ReadQuota>> => {
  return await skeletonApi.quotas.getQuotas(params);
};

export const useGetQuotas = (
  params: GetCollectionQueryParams<ReadQuota, GetQuotasFilter>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadQuota>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['quotas', params],
    queryFn: () => getQuotas(params),
    ...options,
  });
