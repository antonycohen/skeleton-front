import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { AdjustQuota, ReadQuota } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type AdjustQuotaParams = {
  organizationId: string;
  data: AdjustQuota;
};

export const adjustQuota = async (
  params: AdjustQuotaParams,
): Promise<ReadQuota> => {
  return await skeletonApi.quotas.adjustQuota(params.organizationId, params.data);
};

export const useAdjustQuota = (
  options?: Omit<
    UseMutationOptions<ReadQuota, ApiError, AdjustQuotaParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adjustQuota,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] });
      // A limit change also writes an ADJUST transaction on the quota.
      queryClient.invalidateQueries({ queryKey: ['quota-transactions'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
