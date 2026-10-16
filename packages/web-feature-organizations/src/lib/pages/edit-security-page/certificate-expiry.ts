import { ReadSsoCertificate } from '@skeleton/core-api-models';

/** A rotation takes a few days of coordination with the provider; a month's notice is the point. */
export const CERTIFICATE_EXPIRY_WARNING_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type CertificateExpiryState =
  | { kind: 'valid' }
  | { kind: 'expiring'; daysLeft: number }
  | { kind: 'expired' }
  | { kind: 'not_yet_valid' }
  | { kind: 'unknown' };

/**
 * What to say about a certificate's validity. The API's own `status` is read at its own clock and
 * decides the two ends; the warning in between is this page's, and is what tells an admin to start
 * a rotation before a sign-in breaks.
 */
export function certificateExpiryState(
  certificate: Pick<ReadSsoCertificate, 'status' | 'notAfter'> | undefined,
  now: Date,
): CertificateExpiryState {
  if (!certificate) {
    return { kind: 'unknown' };
  }
  if (certificate.status === 'expired') {
    return { kind: 'expired' };
  }
  if (certificate.status === 'not_yet_valid') {
    return { kind: 'not_yet_valid' };
  }
  if (!certificate.notAfter) {
    return { kind: 'unknown' };
  }

  const msLeft = new Date(certificate.notAfter).getTime() - now.getTime();
  if (Number.isNaN(msLeft)) {
    return { kind: 'unknown' };
  }
  if (msLeft <= 0) {
    return { kind: 'expired' };
  }

  const daysLeft = Math.ceil(msLeft / MS_PER_DAY);

  return daysLeft <= CERTIFICATE_EXPIRY_WARNING_DAYS
    ? { kind: 'expiring', daysLeft }
    : { kind: 'valid' };
}
