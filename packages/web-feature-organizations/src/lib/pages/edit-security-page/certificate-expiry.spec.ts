import { describe, expect, it } from 'vitest';
import { ReadSsoCertificate } from '@skeleton/core-api-models';
import { certificateExpiryState } from './certificate-expiry';

const NOW = new Date('2026-09-22T12:00:00Z');

const certificate = (
  status: ReadSsoCertificate['status'],
  notAfter: string | null,
): Pick<ReadSsoCertificate, 'status' | 'notAfter'> => ({ status, notAfter });

describe('certificateExpiryState', () => {
  it('is fine while the expiry is further out than a month', () => {
    expect(certificateExpiryState(certificate('valid', '2027-01-01T00:00:00Z'), NOW)).toEqual({
      kind: 'valid',
    });
  });

  it('warns within thirty days, and counts them', () => {
    const state = certificateExpiryState(
      certificate('valid', '2026-10-02T12:00:00Z'),
      NOW,
    );

    expect(state).toEqual({ kind: 'expiring', daysLeft: 10 });
  });

  it('takes the API at its word on the two ends', () => {
    expect(
      certificateExpiryState(certificate('expired', '2027-01-01T00:00:00Z'), NOW).kind,
    ).toBe('expired');
    expect(
      certificateExpiryState(certificate('not_yet_valid', '2027-01-01T00:00:00Z'), NOW).kind,
    ).toBe('not_yet_valid');
  });

  it('is expired once the date is past, whatever the status said', () => {
    expect(
      certificateExpiryState(certificate('valid', '2026-09-22T11:00:00Z'), NOW).kind,
    ).toBe('expired');
  });

  it('says nothing about a certificate it cannot read', () => {
    expect(certificateExpiryState(certificate('valid', null), NOW).kind).toBe('unknown');
    expect(certificateExpiryState(certificate('valid', 'not-a-date'), NOW).kind).toBe('unknown');
    expect(certificateExpiryState(undefined, NOW).kind).toBe('unknown');
  });
});
