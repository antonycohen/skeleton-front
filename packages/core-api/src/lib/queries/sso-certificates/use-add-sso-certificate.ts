import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { CreateSsoCertificate, ReadSsoCertificate } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from '../sso-connections/invalidate-sso-queries';

export type AddSsoCertificateParams = {
  organizationId: string;
  data: CreateSsoCertificate;
};

export const addSsoCertificate = async (
  params: AddSsoCertificateParams,
): Promise<ReadSsoCertificate> => {
  return await skeletonApi.ssoCertificates.addSsoCertificate(
    params.organizationId,
    params.data,
  );
};

/**
 * Registers a second certificate, which is how a rotation starts. The API refuses a weak or expired
 * one (422, 5509) and a third one (409, 5510) with the message to show; adding one leaves the
 * connection's status alone, so nothing here demotes it.
 */
export const useAddSsoCertificate = (
  options?: Omit<
    UseMutationOptions<ReadSsoCertificate, ApiError, AddSsoCertificateParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSsoCertificate,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
