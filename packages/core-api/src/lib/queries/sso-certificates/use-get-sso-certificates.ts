import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ReadSsoCertificate } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { GetSsoCertificatesStaticFilter } from '../../endpoints/sso-certificates';
import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';

export type GetSsoCertificatesParams = GetCollectionQueryParams<
  ReadSsoCertificate,
  GetSsoCertificatesStaticFilter
>;

export const getSsoCertificates = async (
  params: GetSsoCertificatesParams,
): Promise<ApiCollectionResponse<ReadSsoCertificate>> => {
  return await skeletonApi.ssoCertificates.getSsoCertificates(params);
};

/**
 * The SAML connection's registered certificates (at most two). 404 while the connection is not
 * SAML or does not exist, which is not a failure worth retrying.
 */
export const useGetSsoCertificates = (
  params: GetSsoCertificatesParams,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadSsoCertificate>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['sso-certificates', params.staticParams?.organizationId, params],
    queryFn: () => getSsoCertificates(params),
    retry: false,
    ...options,
  });
