import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ServiceAccount } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type GetServiceAccountsStaticParams = {
  organizationId: string;
};

export type GetServiceAccountsParams = GetCollectionQueryParams<
  ServiceAccount,
  GetServiceAccountsStaticParams
>;

export const getServiceAccounts = async (
  params: GetServiceAccountsParams,
): Promise<ApiCollectionResponse<ServiceAccount>> => {
  return await skeletonApi.serviceAccounts.getServiceAccounts(params);
};

export const useGetServiceAccounts = (
  params: GetServiceAccountsParams,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ServiceAccount>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['service-accounts', params.staticParams?.organizationId, params],
    queryFn: () => getServiceAccounts(params),
    ...options,
  });
