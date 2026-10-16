import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReadSsoConnection } from '@skeleton/core-api-models';

const saveMutate = vi.fn();
const patchMutate = vi.fn();

vi.mock('@skeleton/core-api', () => ({
  useSaveSsoConnection: () => ({ mutate: saveMutate, isPending: false }),
  usePatchSsoConnection: () => ({ mutate: patchMutate, isPending: false }),
}));

const { SsoServiceProviderValues } = await import('./sso-service-provider-values');

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';

const samlConnection = {
  id: 'c0ffee00-0000-4000-8000-000000000002',
  protocol: 'saml',
  spEntityId: 'https://api.example.test/saml2/service-provider-metadata/sso-c0ffee',
  spAcsUrl: 'https://api.example.test/login/saml2/sso/sso-c0ffee',
  spMetadataUrl: 'https://api.example.test/saml2/service-provider-metadata/sso-c0ffee',
  spCertificate: '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n',
  spCertificateNotAfter: '2027-03-01T00:00:00Z',
} as ReadSsoConnection;

beforeEach(() => vi.clearAllMocks());

describe('SsoServiceProviderValues', () => {
  it('issues the values with the protocol alone when the workspace has no connection', () => {
    render(
      <SsoServiceProviderValues organizationId={ORGANIZATION_ID} connection={undefined} />,
    );

    fireEvent.click(screen.getByText('Get the values for my provider'));

    expect(saveMutate).toHaveBeenCalledWith({ organizationId: ORGANIZATION_ID, data: { protocol: 'saml' } });
    expect(patchMutate).not.toHaveBeenCalled();
  });

  it('switches an existing connection instead of replacing it', () => {
    render(
      <SsoServiceProviderValues
        organizationId={ORGANIZATION_ID}
        connection={{ id: samlConnection.id, protocol: 'oidc' } as ReadSsoConnection}
      />,
    );

    fireEvent.click(screen.getByText('Get the values for my provider'));

    expect(patchMutate).toHaveBeenCalledWith({ organizationId: ORGANIZATION_ID, data: { protocol: 'saml' } });
    expect(saveMutate).not.toHaveBeenCalled();
  });

  it('shows the values and the signing certificate once the connection exists', () => {
    render(
      <SsoServiceProviderValues organizationId={ORGANIZATION_ID} connection={samlConnection} />,
    );

    // The entity id doubles as the metadata address: shown twice, on purpose
    expect(screen.getAllByText(samlConnection.spEntityId as string)).toHaveLength(2);
    expect(screen.getByText(samlConnection.spAcsUrl as string)).toBeTruthy();
    expect(screen.getByText(/Valid until 01\/03\/2027/)).toBeTruthy();
    const downloads = screen.getAllByText('Download');
    const download = downloads[downloads.length - 1] as HTMLAnchorElement;
    expect(download.getAttribute('download')).toBe('sp-certificate.pem');
    expect(download.getAttribute('href')).toContain('BEGIN%20CERTIFICATE');
  });
});
