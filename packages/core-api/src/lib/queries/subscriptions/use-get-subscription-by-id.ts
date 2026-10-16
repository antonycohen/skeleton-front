import { GetQueryByIdParams } from '../../types';
import { ReadSubscription } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getSubscriptionById = async (
  params: GetQueryByIdParams<ReadSubscription>,
): Promise<ReadSubscription> => {
  return await skeletonApi.subscriptions.getSubscription(params);
};

export const useGetSubscriptionById = (
  params: GetQueryByIdParams<ReadSubscription>,
  options?: Omit<UseQueryOptions<ReadSubscription, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['subscriptions', params.id, params.fields],
    queryFn: () => getSubscriptionById(params),
    ...options,
  });
