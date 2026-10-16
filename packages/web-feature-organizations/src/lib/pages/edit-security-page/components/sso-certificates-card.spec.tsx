import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReadSsoCertificate, ReadSsoConnection } from '@skeleton/core-api-models';

const addMutate = vi.fn();
const deleteMutate = vi.fn();
const importMutate = vi.fn();
let certificateRows: ReadSsoCertificate[] = [];

vi.mock('@skeleton/core-api', () => ({
  useGetSsoCertificates: () => ({
    data: { data: certificateRows, pagination: { count: certificateRows.length } },
    isLoading: false,
  }),
  useAddSsoCertificate: () => ({ mutate: addMutate, isPending: false, error: null }),
  useDeleteSsoCertificate: () => ({ mutate: deleteMutate, isPending: false }),
  useImportSsoConnectionMetadata: () => ({ mutate: importMutate, isPending: false }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { SsoCertificatesCard } = await import('./sso-certificates-card');

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';
const A_YEAR_AHEAD = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
const IN_TWO_WEEKS = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

const certificate = (
  id: string,
  overrides: Partial<ReadSsoCertificate> = {},
): ReadSsoCertificate =>
  ({
    id,
    fingerprintSha256: `fingerprint-${id}`,
    subject: `CN=acme-${id}`,
    notBefore: '2026-01-01T00:00:00Z',
    notAfter: A_YEAR_AHEAD,
    status: 'valid',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }) as ReadSsoCertificate;

const connection = (overrides: Partial<ReadSsoConnection> = {}): ReadSsoConnection =>
  ({
    id: 'c0000000-0000-4000-8000-000000000001',
    protocol: 'saml',
    status: 'enabled',
    ...overrides,
  }) as ReadSsoConnection;

const renderCard = (
  rows: ReadSsoCertificate[],
  overrides: Partial<ReadSsoConnection> = {},
) => {
  certificateRows = rows;
  return render(
    <SsoCertificatesCard
      organizationId={ORGANIZATION_ID}
      connection={connection(overrides)}
    />,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  certificateRows = [];
});

describe('SsoCertificatesCard', () => {
  it('lists what a response is verified with, and offers registering one more', () => {
    renderCard([certificate('1')]);

    expect(screen.getByText('CN=acme-1')).toBeTruthy();
    expect(screen.getByText('fingerprint-1')).toBeTruthy();
    expect(screen.getByText('Valid')).toBeTruthy();
    expect(screen.getByText('Register a second certificate')).toBeTruthy();
  });

  it('badges a certificate that is about to expire, so a rotation starts in time', () => {
    renderCard([certificate('1', { notAfter: IN_TWO_WEEKS })]);

    expect(screen.getByText('Expires in 14 days')).toBeTruthy();
  });

  it('registers a pasted certificate', () => {
    renderCard([]);

    fireEvent.change(screen.getByPlaceholderText('-----BEGIN CERTIFICATE-----'), {
      target: { value: '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----' },
    });
    fireEvent.click(screen.getByText('Add certificate'));

    expect(addMutate).toHaveBeenCalledWith({
      organizationId: ORGANIZATION_ID,
      data: {
        pem: '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----',
      },
    });
  });

  // Two is the most the API registers, which is exactly what a rotation needs: offering a third
  // would only earn a 409.
  it('stops offering a certificate once two are registered, and says why', () => {
    renderCard([certificate('1'), certificate('2')]);

    expect(screen.queryByText('Add certificate')).toBeNull();
    expect(screen.getByText(/Two certificates are registered/)).toBeTruthy();
  });

  it('warns that removing the last valid one switches single sign-on off', () => {
    renderCard([certificate('1')]);

    fireEvent.click(screen.getByLabelText('Remove certificate fingerprint-1'));

    expect(screen.getByText('Remove this certificate?')).toBeTruthy();
    expect(screen.getByText(/No valid certificate would be left/)).toBeTruthy();

    fireEvent.click(screen.getByText('Remove certificate'));
    expect(deleteMutate).toHaveBeenCalledWith({
      organizationId: ORGANIZATION_ID,
      certificateId: '1',
    });
  });

  it('does not warn while another valid certificate stays', () => {
    renderCard([certificate('1'), certificate('2')]);

    fireEvent.click(screen.getByLabelText('Remove certificate fingerprint-1'));

    expect(screen.getByText('Remove this certificate?')).toBeTruthy();
    expect(screen.queryByText(/No valid certificate would be left/)).toBeNull();
  });

  // The scheduled re-read only reports what the provider announces; applying it is an act of the
  // admin's, because it is a change of trust.
  it('offers applying the provider current certificates once its metadata differs', () => {
    renderCard([certificate('1')], {
      idpMetadataUrl: 'https://acme.okta.com/metadata',
      idpMetadataChangedAt: '2026-09-20T10:00:00Z',
    });

    expect(screen.getByText(/announcing other certificates/)).toBeTruthy();
    fireEvent.click(screen.getByText("Apply the provider's current certificates"));

    expect(importMutate).toHaveBeenCalledWith({ organizationId: ORGANIZATION_ID });
  });

  it('says nothing about metadata for a connection filled in by hand', () => {
    renderCard([certificate('1')], { idpMetadataChangedAt: '2026-09-20T10:00:00Z' });

    expect(screen.queryByText(/announcing other certificates/)).toBeNull();
  });
});
