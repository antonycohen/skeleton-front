import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ReadSsoDomain } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { GetSsoDomainsStaticFilter } from '../../endpoints/sso-domains';
import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';

export type GetSsoDomainsParams = GetCollectionQueryParams<
  ReadSsoDomain,
  GetSsoDomainsStaticFilter
>;

export const getSsoDomains = async (
  params: GetSsoDomainsParams,
): Promise<ApiCollectionResponse<ReadSsoDomain>> => {
  return await skeletonApi.ssoDomains.getSsoDomains(params);
};

/**
 * The workspace's claimed domains, oldest first (the API's own order). Keyed under the workspace so
 * that every SSO mutation can invalidate the set at once. A refused read is not retried.
 */
export const useGetSsoDomains = (
  params: GetSsoDomainsParams,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadSsoDomain>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['sso-domains', params.staticParams?.organizationId, params],
    queryFn: () => getSsoDomains(params),
    retry: false,
    ...options,
  });
