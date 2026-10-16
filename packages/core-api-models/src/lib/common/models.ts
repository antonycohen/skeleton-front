import * as z from 'zod';

// DataPoint schema - used within TimeSeries
export const dataPointSchema = z.object({
  name: z.string().nullable(),
  date: z.iso.datetime().nullable(),
  value: z.number().nullable(),
});
export type DataPoint = z.infer<typeof dataPointSchema>;

// TimeSeries read schema - API response
export const readTimeSeriesSchema = z.object({
  name: z.string().nullable(),
  series: z.array(dataPointSchema).nullable(),
});
export type ReadTimeSeries = z.infer<typeof readTimeSeriesSchema>;

// Legacy export for convenience
export const timeSeriesSchema = readTimeSeriesSchema;
export type TimeSeries = ReadTimeSeries;

