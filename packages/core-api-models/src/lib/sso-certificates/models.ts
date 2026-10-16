import * as z from 'zod';
import { readUserRefSchema } from '../users';

// Enums
/** As of the read: a certificate does not change, the clock does. */
export const ssoCertificateStatusEnum = z.enum([
  'valid',
  'not_yet_valid',
  'expired',
]);
export type SsoCertificateStatus = z.infer<typeof ssoCertificateStatusEnum>;

/** The API refuses a PEM longer than this, so the file picker does too. */
export const SSO_CERTIFICATE_MAX_LENGTH = 16_384;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readSsoCertificateRefSchema = z.object({
  id: z.uuid(),
  fingerprintSha256: z.string(),
});
export type ReadSsoCertificateRef = z.infer<typeof readSsoCertificateRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const ssoCertificateRefSchema = z.object({
  id: z.uuid(),
});
export type SsoCertificateRef = z.infer<typeof ssoCertificateRefSchema>;

// 3. Read schema - all properties nullable (API response)
// The PEM is public material and comes back when asked for, so that an admin can compare it with
// what their provider publishes; everything else is read from the certificate and read-only.
export const readSsoCertificateSchema = z.object({
  id: z.uuid().nullable(),
  pem: z.string().nullable(),
  fingerprintSha256: z.string().nullable(),
  subject: z.string().nullable(),
  notBefore: z.iso.datetime().nullable(),
  notAfter: z.iso.datetime().nullable(),
  status: ssoCertificateStatusEnum.nullable(),
  createdAt: z.iso.datetime().nullable(),
  createdBy: z.lazy(() => readUserRefSchema).nullable(),
});
export type ReadSsoCertificate = z.infer<typeof readSsoCertificateSchema>;

// 4. Create schema - registering a certificate is sending its PEM, nothing else.
export const createSsoCertificateSchema = z.object({
  pem: z
    .string()
    .min(1, 'validation.ssoCertificate.pemRequired')
    .max(
      SSO_CERTIFICATE_MAX_LENGTH,
      'validation.ssoCertificate.pemTooLong',
    ),
});
export type CreateSsoCertificate = z.infer<typeof createSsoCertificateSchema>;

// Legacy exports
export const ssoCertificateSchema = readSsoCertificateSchema;
export type SsoCertificate = ReadSsoCertificate;
