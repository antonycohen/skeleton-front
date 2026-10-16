import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { SsoStatusCardProps } from './sso-status-card';
import { SsoSection } from './sso-section';

let connectionQuery: { data?: unknown; isLoading: boolean; error?: unknown };
let domainsQuery: { data?: unknown; isLoading: boolean; error?: unknown };
let statusCardProps: SsoStatusCardProps | undefined;

vi.mock('@skeleton/core-api', () => ({
  useGetSsoConnection: () => connectionQuery,
  useGetSsoDomains: () => domainsQuery,
  useUpdateSsoConnectionEnablement: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-sso-test-sign-in', () => ({
  useSsoTestSignIn: () => ({ startTest: vi.fn(), isTesting: false }),
}));

// The section is what is under test: which loading state it hands the status card. The cards
// themselves have their own specs.
vi.mock('./sso-status-card', () => ({
  SsoStatusCard: (props: SsoStatusCardProps) => {
    statusCardProps = props;
    return null;
  },
}));
vi.mock('./sso-verified-domains-card', () => ({ SsoVerifiedDomainsCard: () => null }));
vi.mock('./sso-identity-provider-card', () => ({ SsoIdentityProviderCard: () => null }));
vi.mock('./sso-certificates-card', () => ({ SsoCertificatesCard: () => null }));
vi.mock('./sso-provisioning-card', () => ({ SsoProvisioningCard: () => null }));

const renderSection = () =>
  render(<SsoSection organizationId="org-1" members={[]} membersTotalCount={0} />);

beforeEach(() => {
  statusCardProps = undefined;
  connectionQuery = { data: { id: 'c-1', protocol: 'oidc', status: 'tested' }, isLoading: false };
  domainsQuery = {
    data: { data: [{ id: 'd-1', domain: 'acme.com', status: 'verified' }], pagination: { count: 1 } },
    isLoading: false,
  };
});

describe('SsoSection', () => {
  // Enable depends on a verified domain: judged before the domains arrive, it would say "verify a
  // domain first" and stay disabled for a workspace that has one.
  it('keeps the status card loading while the domains are, even with the connection loaded', () => {
    domainsQuery = { data: undefined, isLoading: true };

    renderSection();

    expect(statusCardProps?.isLoading).toBe(true);
    expect(statusCardProps?.hasVerifiedDomain).toBe(false);
  });

  it('keeps the status card loading while the connection is', () => {
    connectionQuery = { data: undefined, isLoading: true };

    renderSection();

    expect(statusCardProps?.isLoading).toBe(true);
  });

  it('shows the status once both are known', () => {
    renderSection();

    expect(statusCardProps?.isLoading).toBe(false);
    expect(statusCardProps?.hasVerifiedDomain).toBe(true);
  });
});
