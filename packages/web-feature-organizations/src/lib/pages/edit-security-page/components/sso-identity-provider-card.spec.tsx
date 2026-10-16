import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReadSsoConnection } from '@skeleton/core-api-models';

const saveMutate = vi.fn();
const patchMutate = vi.fn();

vi.mock('@skeleton/core-api', () => ({
  useSaveSsoConnection: () => ({ mutate: saveMutate, isPending: false }),
  usePatchSsoConnection: () => ({ mutate: patchMutate, isPending: false }),
  useGetSsoCertificates: () => ({ data: { data: [], pagination: { count: 0 } }, isLoading: false }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { SsoIdentityProviderCard } = await import('./sso-identity-provider-card');

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';

// The SAML form holds Radix selects, which measure themselves through an API jsdom has not.
class ResizeObserverStub {
  observe(): void {/* nothing reacts to a resize in these tests */}
  unobserve(): void {/* nothing was observed */}
  disconnect(): void {/* nothing was observed */}
}

const oidcConnection = (): ReadSsoConnection =>
  ({
    id: 'c0000000-0000-4000-8000-000000000001',
    protocol: 'oidc',
    status: 'enabled',
    issuer: 'https://acme.okta.com',
    clientId: 'client-1',
    clientSecretSet: true,
    redirectUri: 'https://api.example.test/login/oauth2/code/sso-c0000000',
  }) as ReadSsoConnection;

const renderCard = (connection?: ReadSsoConnection) =>
  render(
    <SsoIdentityProviderCard
      organizationId={ORGANIZATION_ID}
      connection={connection}
      isLoading={false}
    />,
  );

const pickProtocol = (name: string) =>
  fireEvent.click(screen.getByRole('radio', { name }));

beforeEach(() => {
  vi.clearAllMocks();
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
});

describe('SsoIdentityProviderCard', () => {
  it('offers both protocols and starts on the connection, or OpenID Connect', () => {
    renderCard();

    expect(screen.getByRole('radio', { name: 'OpenID Connect' }).getAttribute('data-state')).toBe(
      'checked',
    );
    expect(screen.getByRole('radio', { name: 'SAML 2.0' })).toBeTruthy();
    expect(screen.getByText('Issuer')).toBeTruthy();
  });

  it('swaps the form straight away while no connection exists', () => {
    renderCard();

    pickProtocol('SAML 2.0');

    expect(screen.getByText('Values from your identity provider')).toBeTruthy();
    expect(screen.queryByText('Issuer')).toBeNull();
    expect(screen.queryByText(/Switch this connection to/)).toBeNull();
  });

  // Changing the protocol of a live connection returns it to draft, drops the material of the
  // protocol being left and unbinds everyone: a stray click must not do that.
  describe('when a connection already exists', () => {
    it('asks before swapping, and says what it costs', () => {
      renderCard(oidcConnection());

      pickProtocol('SAML 2.0');

      expect(screen.getByText('Switch this connection to SAML 2.0?')).toBeTruthy();
      expect(screen.getByText(/returns the connection to draft/)).toBeTruthy();
      expect(screen.getByText(/stored client secret is dropped/)).toBeTruthy();
      // Still the OpenID Connect form behind the dialog.
      expect(screen.getByText('Issuer')).toBeTruthy();
    });

    it('keeps the protocol when the admin backs out', () => {
      renderCard(oidcConnection());
      pickProtocol('SAML 2.0');

      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.queryByText('Switch this connection to SAML 2.0?')).toBeNull();
      expect(screen.getByText('Issuer')).toBeTruthy();
      expect(screen.getByRole('radio', { name: 'OpenID Connect' }).getAttribute('data-state')).toBe(
        'checked',
      );
    });

    it('swaps the form once confirmed, and writes nothing until the form is saved', () => {
      renderCard(oidcConnection());
      pickProtocol('SAML 2.0');

      fireEvent.click(screen.getByText('Switch to SAML 2.0'));

      expect(screen.getByText('Values from your identity provider')).toBeTruthy();
      expect(screen.queryByText('Issuer')).toBeNull();
      expect(saveMutate).not.toHaveBeenCalled();
      expect(patchMutate).not.toHaveBeenCalled();
    });

    it('warns that the certificates go when switching a SAML connection back', () => {
      renderCard({ ...oidcConnection(), protocol: 'saml' } as ReadSsoConnection);

      pickProtocol('OpenID Connect');

      expect(screen.getByText(/registered signing certificates are removed/)).toBeTruthy();
    });
  });
});
