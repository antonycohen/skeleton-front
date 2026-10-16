import {
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  CustomerPortalSessionRequest,
  CustomerPortalSessionResponse,
} from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createPortalSession = async (
  data: CustomerPortalSessionRequest,
): Promise<CustomerPortalSessionResponse> => {
  return await skeletonApi.customerPortal.createPortalSession(data);
};

export const useCreatePortalSession = (
  options?: Omit<
    UseMutationOptions<CustomerPortalSessionResponse, ApiError, CustomerPortalSessionRequest>,
    'mutationFn'
  >,
) => {
  return useMutation<CustomerPortalSessionResponse, ApiError, CustomerPortalSessionRequest>({
    mutationFn: createPortalSession,
    ...options,
  });
};
