import {
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  CheckoutSessionRequest,
  CheckoutSessionResponse,
} from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createCheckoutSession = async (
  data: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> => {
  return await skeletonApi.subscriptions.createCheckoutSession(data);
};

export const useCreateCheckoutSession = (
  options?: Omit<
    UseMutationOptions<CheckoutSessionResponse, ApiError, CheckoutSessionRequest>,
    'mutationFn'
  >,
) => {
  return useMutation<CheckoutSessionResponse, ApiError, CheckoutSessionRequest>({
    mutationFn: createCheckoutSession,
    ...options,
  });
};
