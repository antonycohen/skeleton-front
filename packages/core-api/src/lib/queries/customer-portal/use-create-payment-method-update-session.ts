import {
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  CustomerPortalSessionRequest,
  CustomerPortalSessionResponse,
} from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createPaymentMethodUpdateSession = async (
  data: CustomerPortalSessionRequest,
): Promise<CustomerPortalSessionResponse> => {
  return await skeletonApi.customerPortal.createPaymentMethodUpdateSession(data);
};

export const useCreatePaymentMethodUpdateSession = (
  options?: Omit<
    UseMutationOptions<CustomerPortalSessionResponse, ApiError, CustomerPortalSessionRequest>,
    'mutationFn'
  >,
) => {
  return useMutation<CustomerPortalSessionResponse, ApiError, CustomerPortalSessionRequest>({
    mutationFn: createPaymentMethodUpdateSession,
    ...options,
  });
};
