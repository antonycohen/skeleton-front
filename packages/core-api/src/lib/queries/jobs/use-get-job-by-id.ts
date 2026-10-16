import { GetQueryByIdParams } from '../../types';
import { ReadJob } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getJobById = async (
  params: GetQueryByIdParams<ReadJob>,
): Promise<ReadJob> => {
  return await skeletonApi.jobs.getJob(params);
};

export const useGetJobById = (
  params: GetQueryByIdParams<ReadJob>,
  options?: Omit<UseQueryOptions<ReadJob, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['job', params.id, params.fields],
    queryFn: () => getJobById(params),
    ...options,
  });
