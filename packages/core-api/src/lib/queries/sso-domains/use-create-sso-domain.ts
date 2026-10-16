import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { CreateSsoDomain, ReadSsoDomain } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from '../sso-connections/invalidate-sso-queries';

export type CreateSsoDomainParams = {
  organizationId: string;
  data: CreateSsoDomain;
};

export const createSsoDomain = async (
  params: CreateSsoDomainParams,
): Promise<ReadSsoDomain> => {
  return await skeletonApi.ssoDomains.createSsoDomain(
    params.organizationId,
    params.data,
  );
};

/**
 * Claims a domain. The answer carries the TXT record to publish; the API refuses a public e-mail
 * provider or a name another workspace has verified, with the message to show.
 */
export const useCreateSsoDomain = (
  options?: Omit<
    UseMutationOptions<ReadSsoDomain, ApiError, CreateSsoDomainParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSsoDomain,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
