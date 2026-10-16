import { ServiceAccountPermissionCatalogEntry } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export type GetServiceAccountPermissionCatalogParams = {
  organizationId: string;
};

export const getServiceAccountPermissionCatalog = async (
  params: GetServiceAccountPermissionCatalogParams,
): Promise<ServiceAccountPermissionCatalogEntry[]> => {
  return await skeletonApi.serviceAccounts.getServiceAccountPermissionCatalog(
    params.organizationId,
  );
};

export const useGetServiceAccountPermissionCatalog = (
  params: GetServiceAccountPermissionCatalogParams,
  options?: Omit<
    UseQueryOptions<ServiceAccountPermissionCatalogEntry[], ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['service-account-permission-catalog', params.organizationId],
    queryFn: () => getServiceAccountPermissionCatalog(params),
    ...options,
  });
