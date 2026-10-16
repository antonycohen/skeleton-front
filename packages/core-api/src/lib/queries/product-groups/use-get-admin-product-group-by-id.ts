import { GetQueryByIdParams } from '../../types';
import { ReadProductGroup } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getAdminProductGroupById = async (
  params: GetQueryByIdParams<ReadProductGroup>,
): Promise<ReadProductGroup> => {
  return await skeletonApi.productGroups.getAdminProductGroup(params);
};

/**
 * Back-office read of a product group on the authenticated endpoint (any field graph, inactive
 * groups too), as opposed to `useGetProductGroupById`, which hits the public endpoint with its
 * fixed graph. The key stays under `['product-groups']` so the create/update invalidations apply,
 * and never collides with the public entry for the same id.
 */
export const useGetAdminProductGroupById = (
  params: GetQueryByIdParams<ReadProductGroup>,
  options?: Omit<UseQueryOptions<ReadProductGroup, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['product-groups', 'admin', params.id, params.fields],
    queryFn: () => getAdminProductGroupById(params),
    ...options,
  });
