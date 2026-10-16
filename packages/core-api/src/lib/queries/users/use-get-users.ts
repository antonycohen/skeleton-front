import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { User } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getUsers = async (
  params: GetCollectionQueryParams<User>,
): Promise<ApiCollectionResponse<User>> => {
  return await skeletonApi.users.getUsers(params);
};

export const useGetUsers = (
  params: GetCollectionQueryParams<User>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<User>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    ...options,
  });
