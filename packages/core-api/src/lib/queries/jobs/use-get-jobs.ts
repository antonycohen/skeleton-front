import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ReadJob } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetJobsFilter } from '../../endpoints/jobs';

export const getJobs = async (
  params: GetCollectionQueryParams<ReadJob, GetJobsFilter>,
): Promise<ApiCollectionResponse<ReadJob>> => {
  return await skeletonApi.jobs.getJobs(params);
};

export const useGetJobs = (
  params: GetCollectionQueryParams<ReadJob, GetJobsFilter>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadJob>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['jobs', params],
    queryFn: () => getJobs(params),
    ...options,
  });
