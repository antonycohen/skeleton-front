import * as z from 'zod';
import {readFeatureRefSchema} from '../features';
import {aggregationType} from '../meters';

// Enums
export const quotaOperationType = z.enum(['CONSUME', 'ALLOCATE', 'REFUND', 'RESET', 'ADJUST']);
export type QuotaOperationType = z.infer<typeof quotaOperationType>;

// Serialized lowercase by the API (QuotaStatusEnum carries a @JsonValue).
export const quotaStatus = z.enum(['active', 'superseded', 'expired', 'cancelled']);
export type QuotaStatus = z.infer<typeof quotaStatus>;

// QuotaTransaction schemas
// 1. Reference schema with label field
export const readQuotaTransactionRefSchema = z.object({
  id: z.uuid(),
});
export type ReadQuotaTransactionRef = z.infer<typeof readQuotaTransactionRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const quotaTransactionRefSchema = z.object({
  id: z.uuid(),
});
export type QuotaTransactionRef = z.infer<typeof quotaTransactionRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readQuotaTransactionSchema = z.object({
  id: z.uuid().nullable(),
  amount: z.number().nullable(),
  operationType: quotaOperationType.nullable(),
  description: z.string().nullable(),
  referenceType: z.string().nullable(),
  referenceId: z.uuid().nullable(),
  metadata: z.record(z.string(), z.string()).nullable(),
  createdAt: z.iso.datetime().nullable(),
});
export type ReadQuotaTransaction = z.infer<typeof readQuotaTransactionSchema>;

// Quota schemas
// 1. Reference schema with label field
export const readQuotaRefSchema = z.object({
  id: z.uuid(),
  featureKey: z.string(),
});
export type ReadQuotaRef = z.infer<typeof readQuotaRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const quotaRefSchema = z.object({
  id: z.uuid(),
});
export type QuotaRef = z.infer<typeof quotaRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readQuotaSchema = z.object({
  id: z.uuid().nullable(),
  featureKey: z.string().nullable(),
  feature: readFeatureRefSchema.nullable(),
  aggregationType: aggregationType.nullable(),
  status: quotaStatus.nullable(),
  periodStart: z.iso.datetime().nullable(),
  periodEnd: z.iso.datetime().nullable(),
  quotaLimit: z.number().nullable(),
  currentUsage: z.number().nullable(),
  remainingQuota: z.number().nullable(),
  transactions: z.array(readQuotaTransactionSchema).nullable(),
  metadata: z.record(z.string(), z.string()).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadQuota = z.infer<typeof readQuotaSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
// The admin API adjusts a quota rather than replacing it: the limit moves by a
// signed delta, and the period end moves to a new instant. Both are optional and
// applied in a single operation, but the backend rejects a body carrying neither.
export const adjustQuotaSchema = z
  .object({
    featureKey: z.string().min(1, 'validation.feature.keyRequired'),
    amount: z
      .number()
      .int('validation.quota.amountInteger')
      .refine((value) => value !== 0, 'validation.quota.amountNotZero')
      .optional(),
    // The backend only accepts a future instant: a past end would drop the quota
    // out of the current window immediately (it matches on periodEnd > now).
    periodEnd: z.iso.datetime().optional(),
    reason: z
      .string()
      .max(250, 'validation.quota.reasonTooLong')
      .optional(),
  })
  .refine(
    (data) => data.amount !== undefined || data.periodEnd !== undefined,
    'validation.quota.amountOrPeriodEndRequired',
  );
export type AdjustQuota = z.infer<typeof adjustQuotaSchema>;


// Legacy exports for backward compatibility
export const quotaSchema = readQuotaSchema;
export type Quota = ReadQuota;

export const quotaTransactionSchema = readQuotaTransactionSchema;
export type QuotaTransaction = ReadQuotaTransaction;
