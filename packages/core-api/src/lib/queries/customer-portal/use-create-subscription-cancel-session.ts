import {
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  CustomerPortalSessionRequest,
  CustomerPortalSessionResponse,
} from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createSubscriptionCancelSession = async (
  data: CustomerPortalSessionRequest,
): Promise<CustomerPortalSessionResponse> => {
  return await skeletonApi.customerPortal.createSubscriptionCancelSession(data);
};

export const useCreateSubscriptionCancelSession = (
  options?: Omit<
    UseMutationOptions<CustomerPortalSessionResponse, ApiError, CustomerPortalSessionRequest>,
    'mutationFn'
  >,
) => {
  return useMutation<CustomerPortalSessionResponse, ApiError, CustomerPortalSessionRequest>({
    mutationFn: createSubscriptionCancelSession,
    ...options,
  });
};
