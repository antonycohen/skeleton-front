import * as z from 'zod';

// Enums
export const jobStatus = z.enum(['queued', 'running', 'paused', 'cancelled', 'completed', 'failed']);
export type JobStatus = z.infer<typeof jobStatus>;

export const jobName = z.enum(['data_export']);
export type JobName = z.infer<typeof jobName>;

// Job state schemas, discriminated by job name. Add one entry per job type.
export const dataExportStateSchema = z.object({
  total: z.number().nullable(),
  processed: z.number().nullable(),
});
export type DataExportState = z.infer<typeof dataExportStateSchema>;

export const jobStateSchema = z.discriminatedUnion('name', [
  z.object({
    name: z.literal('data_export'),
    state: dataExportStateSchema.nullable(),
  }),
]);
export type JobState = z.infer<typeof jobStateSchema>;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readJobRefSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  status: jobStatus,
});
export type ReadJobRef = z.infer<typeof readJobRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const jobRefSchema = z.object({
  id: z.uuid(),
});
export type JobRef = z.infer<typeof jobRefSchema>;

// 3. Read schema - all properties nullable (API response)
// `state` shape is discriminated by `name` (see jobStateSchema).
export const readJobSchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().nullable(),
  status: jobStatus.nullable(),
  progress: z.number().nullable(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  state: z.record(z.string(), z.unknown()).nullable(),
  // The organization the job ran for.
  tenantId: z.uuid().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
  startedAt: z.iso.datetime().nullable(),
  completedAt: z.iso.datetime().nullable(),
});
export type ReadJob = z.infer<typeof readJobSchema>;

// Statistics schema for job counts per status
export const jobStatisticsSchema = z.object({
  queuedCount: z.number().nullable(),
  runningCount: z.number().nullable(),
  pausedCount: z.number().nullable(),
  cancelledCount: z.number().nullable(),
  completedCount: z.number().nullable(),
  failedCount: z.number().nullable(),
  estimatedJobsProcessingTimeLeftInSeconds: z.number().nullable(),
});
export type JobStatistics = z.infer<typeof jobStatisticsSchema>;

// Legacy export for backward compatibility
export const jobSchema = readJobSchema;
export type Job = ReadJob;
