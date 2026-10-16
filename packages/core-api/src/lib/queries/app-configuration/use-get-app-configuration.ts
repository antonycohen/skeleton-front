import { ReadAppConfiguration } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getAppConfiguration = async (): Promise<ReadAppConfiguration> => {
  return await skeletonApi.appConfiguration.getAppConfiguration();
};

export const useGetAppConfiguration = (
  options?: Omit<UseQueryOptions<ReadAppConfiguration, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['app-configuration'],
    queryFn: () => getAppConfiguration(),
    ...options,
  });
