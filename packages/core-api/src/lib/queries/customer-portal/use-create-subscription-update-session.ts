import {
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  CustomerPortalSessionRequest,
  CustomerPortalSessionResponse,
} from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createSubscriptionUpdateSession = async (
  data: CustomerPortalSessionRequest,
): Promise<CustomerPortalSessionResponse> => {
  return await skeletonApi.customerPortal.createSubscriptionUpdateSession(data);
};

export const useCreateSubscriptionUpdateSession = (
  options?: Omit<
    UseMutationOptions<CustomerPortalSessionResponse, ApiError, CustomerPortalSessionRequest>,
    'mutationFn'
  >,
) => {
  return useMutation<CustomerPortalSessionResponse, ApiError, CustomerPortalSessionRequest>({
    mutationFn: createSubscriptionUpdateSession,
    ...options,
  });
};
