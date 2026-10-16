import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from '../sso-connections/invalidate-sso-queries';

export type DeleteSsoCertificateParams = {
  organizationId: string;
  certificateId: string;
};

export const deleteSsoCertificate = async (
  params: DeleteSsoCertificateParams,
): Promise<void> => {
  return await skeletonApi.ssoCertificates.deleteSsoCertificate(
    params.organizationId,
    params.certificateId,
  );
};

/**
 * Removes a certificate, which is how a rotation ends. Removing the last valid one is a trust
 * change: the connection returns to draft and the requirement is lifted — hence the whole SSO set
 * being invalidated, and the warning the caller shows first.
 */
export const useDeleteSsoCertificate = (
  options?: Omit<
    UseMutationOptions<void, ApiError, DeleteSsoCertificateParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSsoCertificate,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
