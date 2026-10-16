import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ReadSubscription } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetSubscriptionsFilter } from '../../endpoints/subscriptions';

export const getSubscriptions = async (
  params: GetCollectionQueryParams<ReadSubscription, GetSubscriptionsFilter>,
): Promise<ApiCollectionResponse<ReadSubscription>> => {
  return await skeletonApi.subscriptions.getSubscriptions(params);
};

export const useGetSubscriptions = (
  params: GetCollectionQueryParams<ReadSubscription, GetSubscriptionsFilter>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadSubscription>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['subscriptions', params],
    queryFn: () => getSubscriptions(params),
    ...options,
  });
