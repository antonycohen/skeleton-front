import * as z from 'zod';

// Enums
export const aggregationType = z.enum(['count', 'last', 'sum']);
export type AggregationType = z.infer<typeof aggregationType>;

export const eventTimeWindow = z.enum(['day', 'hour']);
export type EventTimeWindow = z.infer<typeof eventTimeWindow>;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readMeterRefSchema = z.object({
  id: z.string(),
  displayName: z.string(),
});
export type ReadMeterRef = z.infer<typeof readMeterRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const meterRefSchema = z.object({
  id: z.string(),
});
export type MeterRef = z.infer<typeof meterRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readMeterSchema = z.object({
  id: z.string().nullable(),
  aggregationFormula: aggregationType.nullable(),
  displayName: z.string().nullable(),
  eventName: z.string().nullable(),
  eventTimeWindow: eventTimeWindow.nullable(),
  customerEventPayloadKey: z.string().nullable(),
  valueEventPayloadKey: z.string().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadMeter = z.infer<typeof readMeterSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
export const createMeterSchema = z.object({
  aggregationFormula: aggregationType,
  displayName: z.string().min(1, 'validation.meter.displayNameRequired'),
  eventName: z.string().min(1, 'validation.meter.eventNameRequired'),
  eventTimeWindow: eventTimeWindow.optional(),
  customerEventPayloadKey: z.string().optional(),
  valueEventPayloadKey: z.string().optional(),
});
export type CreateMeter = z.infer<typeof createMeterSchema>;

// 5. Update schema - based on DTO serialization groups (View.Update)
export const updateMeterSchema = createMeterSchema.partial();
export type UpdateMeter = z.infer<typeof updateMeterSchema>;

// Legacy export for backward compatibility
export const meterSchema = readMeterSchema;
export type Meter = ReadMeter;
