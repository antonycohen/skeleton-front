import {useCreateCheckoutSession} from '@skeleton/core-api';
import {CheckoutSessionResponse} from '@skeleton/core-api-models';

export function usePaywallCheckout() {
  const { mutate: createCheckoutSession, isPending: isCheckoutPending } = useCreateCheckoutSession({
    onSuccess: (data: CheckoutSessionResponse) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
  });

  return { createCheckoutSession, isCheckoutPending };
}
