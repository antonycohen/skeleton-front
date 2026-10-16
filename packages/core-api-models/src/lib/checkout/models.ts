import * as z from 'zod';
import { organizationRefSchema } from '../organizations';
import { priceRefSchema } from '../prices';

// Checkout Session Request schema
export const checkoutSessionRequestSchema = z.object({
  organizationId: organizationRefSchema.shape.id,
  priceId: priceRefSchema.shape.id,
  successUrl: z.url('validation.checkout.successUrlInvalid'),
  cancelUrl: z.url('validation.checkout.cancelUrlInvalid'),
});
export type CheckoutSessionRequest = z.infer<typeof checkoutSessionRequestSchema>;

// Checkout Session Response schema
export const checkoutSessionResponseSchema = z.object({
  checkoutUrl: z.string().nullable(),
});
export type CheckoutSessionResponse = z.infer<typeof checkoutSessionResponseSchema>;
