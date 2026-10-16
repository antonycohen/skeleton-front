import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { CreateSubscription, ReadSubscription } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createSubscription = async (
  data: CreateSubscription,
): Promise<ReadSubscription> => {
  return await skeletonApi.subscriptions.createSubscription(data);
};

/**
 * Super admin: creates a subscription with collection_method=send_invoice
 * (Stripe emails the customer an invoice to pay).
 */
export const useCreateSubscription = (
  options?: Omit<
    UseMutationOptions<ReadSubscription, ApiError, CreateSubscription>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscription,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      // The organization's plan and quotas derive from its subscription.
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
