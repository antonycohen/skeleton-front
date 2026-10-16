import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ReadSsoConnection } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { FieldQuery } from '../../types';

export type GetSsoConnectionParams = {
  organizationId: string;
  fields?: FieldQuery<ReadSsoConnection>;
};

export const getSsoConnection = async (
  params: GetSsoConnectionParams,
): Promise<ReadSsoConnection> => {
  return await skeletonApi.ssoConnections.getSsoConnection(
    params.organizationId,
    params.fields,
  );
};

/**
 * The workspace's connection. A 404 means the workspace has no connection yet — or is not entitled
 * to SSO, which the caller already knows from `organization.ssoAvailable` and never asks for.
 * A refused read is not retried: the answer would not change.
 */
export const useGetSsoConnection = (
  params: GetSsoConnectionParams,
  options?: Omit<UseQueryOptions<ReadSsoConnection, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['sso-connection', params.organizationId, params.fields],
    queryFn: () => getSsoConnection(params),
    retry: false,
    ...options,
  });
