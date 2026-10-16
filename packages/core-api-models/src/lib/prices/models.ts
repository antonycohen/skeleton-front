import * as z from 'zod';
import { readMeterSchema, meterRefSchema } from '../meters';
import { readProductRefSchema, productRefSchema } from '../products';

// Enums
export const priceInterval = z.enum(['day', 'week', 'month', 'year']);
export type PriceInterval = z.infer<typeof priceInterval>;

export const priceUsageType = z.enum(['licensed', 'metered']);
export type PriceUsageType = z.infer<typeof priceUsageType>;

// Mirrors `organizationType` from ../organizations. Declared locally: importing it
// would close a module cycle (organizations -> subscriptions -> prices) and crash
// at module evaluation.
export const priceOrganizationType = z.enum(['individual', 'business', 'agency', 'demo']);
export type PriceOrganizationType = z.infer<typeof priceOrganizationType>;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readPriceRefSchema = z.object({
  id: z.string(),
  nickname: z.string().nullable(),
  currency: z.string(),
});
export type ReadPriceRef = z.infer<typeof readPriceRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const priceRefSchema = z.object({
  id: z.string(),
});
export type PriceRef = z.infer<typeof priceRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readPriceSchema = z.object({
  id: z.string().nullable(),
  nickname: z.string().nullable(),
  product: readProductRefSchema.nullable(),
  currency: z.string().nullable(),
  lookupKey: z.string().nullable(),
  recurringInterval: priceInterval.nullable(),
  recurringIntervalCount: z.number().nullable(),
  recurringMeter: readMeterSchema.nullable(),
  recurringUsageType: priceUsageType.nullable(),
  active: z.boolean().nullable(),
  unitAmountInCents: z.number().nullable(),
  quotas: z.record(z.string(), z.unknown()).nullable(),
  // Organization type this price is intended for (e.g. "business"). Stored in the
  // price metadata (mirrored to Stripe); null for untagged prices.
  organizationType: priceOrganizationType.nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadPrice = z.infer<typeof readPriceSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
export const createPriceSchema = z.object({
  nickname: z.string().optional(),
  product: productRefSchema,
  currency: z.string().min(1, 'validation.price.currencyRequired'),
  lookupKey: z.string().min(1, 'validation.price.lookupKeyRequired'),
  recurringInterval: priceInterval,
  recurringIntervalCount: z.number().optional(),
  recurringMeter: meterRefSchema.optional(),
  recurringUsageType: priceUsageType,
  active: z.boolean().optional(),
  unitAmountInCents: z.number().min(0, 'validation.price.unitAmountNonNegative'),
  quotas: z.record(z.string(), z.unknown()).optional(),
  organizationType: priceOrganizationType.optional(),
});
export type CreatePrice = z.infer<typeof createPriceSchema>;

// 5. Update schema - based on DTO serialization groups (View.Update)
export const updatePriceSchema = createPriceSchema.partial();
export type UpdatePrice = z.infer<typeof updatePriceSchema>;

// Legacy export for backward compatibility
export const priceSchema = readPriceSchema;
export type Price = ReadPrice;
