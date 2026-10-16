import * as z from 'zod';

// Enums
// `suspended`: the DNS record went missing on three daily checks in a row. The domain stops
// routing and comes back by itself once the record is published again.
export const ssoDomainStatusEnum = z.enum(['pending', 'verified', 'suspended']);
export type SsoDomainStatus = z.infer<typeof ssoDomainStatusEnum>;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readSsoDomainRefSchema = z.object({
  id: z.uuid(),
  domain: z.string(),
  status: ssoDomainStatusEnum,
});
export type ReadSsoDomainRef = z.infer<typeof readSsoDomainRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const ssoDomainRefSchema = z.object({
  id: z.uuid(),
});
export type SsoDomainRef = z.infer<typeof ssoDomainRefSchema>;

// 3. Read schema - all properties nullable (API response)
// The verification record is published in the DNS, so it is no secret; it is still only shown to
// those who may configure single sign-on.
export const readSsoDomainSchema = z.object({
  id: z.uuid().nullable(),
  domain: z.string().nullable(),
  status: ssoDomainStatusEnum.nullable(),
  verificationRecordType: z.string().nullable(),
  verificationRecordName: z.string().nullable(),
  verificationRecordValue: z.string().nullable(),
  verifiedAt: z.iso.datetime().nullable(),
  lastCheckedAt: z.iso.datetime().nullable(),
  /** Daily checks in a row that found no record; the domain is suspended at the third. */
  consecutiveFailures: z.number().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadSsoDomain = z.infer<typeof readSsoDomainSchema>;

// 4. Create schema - the only thing a client ever writes; there is no update.
export const createSsoDomainSchema = z.object({
  domain: z
    .string()
    .min(3, 'validation.ssoDomain.domainTooShort')
    .max(253, 'validation.ssoDomain.domainTooLong')
    .regex(
      /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/,
      'validation.ssoDomain.domainInvalid',
    ),
});
export type CreateSsoDomain = z.infer<typeof createSsoDomainSchema>;

// Legacy exports
export const ssoDomainSchema = readSsoDomainSchema;
export type SsoDomain = ReadSsoDomain;
