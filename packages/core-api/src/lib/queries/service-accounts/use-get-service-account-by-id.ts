import { ServiceAccount } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetQueryByIdParams } from '../../types';

export type GetServiceAccountsStaticParams = {
  organizationId: string;
};

export const getServiceAccountById = async (
  params: GetQueryByIdParams<ServiceAccount, GetServiceAccountsStaticParams>,
): Promise<ServiceAccount> => {
  return await skeletonApi.serviceAccounts.getServiceAccount(params);
};

export const useGetServiceAccountById = (
  params: GetQueryByIdParams<ServiceAccount, GetServiceAccountsStaticParams>,
  options?: Omit<UseQueryOptions<ServiceAccount, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['service-account', params.staticParams?.organizationId, params.id, params.fields],
    queryFn: () => getServiceAccountById(params),
    ...options,
  });
