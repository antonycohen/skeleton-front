import * as z from 'zod';
import { organizationRefSchema } from '../organizations';

// Customer Portal Session Request schema
export const customerPortalSessionRequestSchema = z.object({
  organizationId: organizationRefSchema.shape.id,
  returnUrl: z.url('validation.customerPortal.returnUrlInvalid'),
});
export type CustomerPortalSessionRequest = z.infer<typeof customerPortalSessionRequestSchema>;

// Customer Portal Session Response schema
export const customerPortalSessionResponseSchema = z.object({
  url: z.string().nullable(),
});
export type CustomerPortalSessionResponse = z.infer<typeof customerPortalSessionResponseSchema>;
