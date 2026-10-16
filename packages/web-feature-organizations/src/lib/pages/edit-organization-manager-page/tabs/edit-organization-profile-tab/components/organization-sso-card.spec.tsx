import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReadSsoConnection, ReadSsoDomain } from '@skeleton/core-api-models';

const availabilityMutate = vi.fn();
const enforcementMutate = vi.fn();

let connectionState: {
  data?: ReadSsoConnection;
  isLoading: boolean;
  error: { httpCode: number; error: string } | null;
} = { data: undefined, isLoading: false, error: null };
let domainRows: ReadSsoDomain[] = [];
let memberRows: { id: string; status: string; email: string }[] = [];

vi.mock('@skeleton/core-api', () => ({
  useGetSsoConnection: () => connectionState,
  useGetSsoDomains: () => ({
    data: { data: domainRows, pagination: { count: domainRows.length } },
    isLoading: false,
  }),
  useGetOrganizationMembers: () => ({
    data: { data: memberRows, pagination: { count: memberRows.length } },
    isLoading: false,
  }),
  useUpdateOrganizationSsoAvailability: () => ({
    mutate: availabilityMutate,
    isPending: false,
    error: null,
  }),
  useUpdateSsoConnectionEnforcement: () => ({
    mutate: enforcementMutate,
    isPending: false,
    error: null,
  }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { OrganizationSsoCard } = await import('./organization-sso-card');

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';

const connection = (overrides: Partial<ReadSsoConnection> = {}): ReadSsoConnection =>
  ({
    id: 'c0000000-0000-4000-8000-000000000001',
    protocol: 'oidc',
    status: 'enabled',
    ...overrides,
  }) as ReadSsoConnection;

const domain = (name: string, status: ReadSsoDomain['status']): ReadSsoDomain =>
  ({ id: `d-${name}`, domain: name, status }) as ReadSsoDomain;

const renderCard = (ssoAvailable: boolean | null | undefined = true) =>
  render(
    <OrganizationSsoCard
      organizationId={ORGANIZATION_ID}
      ssoAvailable={ssoAvailable}
    />,
  );

beforeEach(() => {
  vi.clearAllMocks();
  connectionState = { data: undefined, isLoading: false, error: null };
  domainRows = [];
  memberRows = [];
});

describe('OrganizationSsoCard', () => {
  it('reads nothing about single sign-on while the workspace is not entitled', () => {
    renderCard(false);

    expect((screen.getByRole('switch') as HTMLButtonElement).dataset.state).toBe(
      'unchecked',
    );
    expect(screen.queryByText('Protocol')).toBeNull();
    expect(screen.queryByText('Status')).toBeNull();
  });

  it('confirms making single sign-on available before calling the API', () => {
    renderCard(false);

    fireEvent.click(screen.getByRole('switch'));

    expect(availabilityMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Make single sign-on available?')).toBeTruthy();

    fireEvent.click(screen.getByText('Make available'));

    expect(availabilityMutate).toHaveBeenCalledWith({
      organizationId: ORGANIZATION_ID,
      available: true,
    });
  });

  it('confirms withdrawing it, and leaves the switch alone on cancel', () => {
    renderCard(true);

    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByText('Withdraw single sign-on?')).toBeTruthy();

    fireEvent.click(screen.getByText('Cancel'));
    expect(availabilityMutate).not.toHaveBeenCalled();
  });

  // The switch is the one control a viewer without the super-admin grant can still see: both
  // `ssoAvailable` and `ssoStatus` are plain fields of the workspace.
  it('waits for the workspace before offering the switch', () => {
    renderCard(null);

    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows what the workspace has configured, without ever offering to require it', () => {
    connectionState = {
      data: connection({
        protocol: 'saml',
        status: 'enabled',
        lastTestedAt: '2026-09-18T09:00:00Z',
        lastTestedBy: { id: 'u1', firstName: null, lastName: null, email: 'admin@acme.com' },
        nearestCertificateExpiry: '2027-03-01T00:00:00Z',
      }),
      isLoading: false,
      error: null,
    };
    domainRows = [domain('acme.com', 'verified'), domain('old.acme.com', 'suspended')];

    renderCard();

    expect(screen.getByText('SAML 2.0')).toBeTruthy();
    expect(screen.getByText('Enabled')).toBeTruthy();
    expect(screen.getByText('acme.com')).toBeTruthy();
    expect(screen.getByText('Suspended domains')).toBeTruthy();
    expect(screen.getByText('old.acme.com')).toBeTruthy();
    expect(screen.getByText('18/09/2026 by admin@acme.com')).toBeTruthy();
    expect(screen.getByText('01/03/2027')).toBeTruthy();
    // Staff lift a requirement, they never set one: the API answers 403 on the enforcement POST.
    expect(screen.queryByText('Require SSO')).toBeNull();
    expect(screen.queryByText('Stop requiring single sign-on')).toBeNull();
  });

  it('leaves the certificate expiry out of an OIDC connection', () => {
    connectionState = {
      data: connection({ protocol: 'oidc', status: 'tested' }),
      isLoading: false,
      error: null,
    };

    renderCard();

    expect(screen.getByText('OpenID Connect')).toBeTruthy();
    expect(screen.getByText('Tested')).toBeTruthy();
    expect(screen.getByText('Never')).toBeTruthy();
    expect(screen.queryByText('Next certificate expiry')).toBeNull();
  });

  it('says since when single sign-on is required, how many members it covers, and offers the lift', () => {
    connectionState = {
      data: connection({
        status: 'enforced',
        enforcedAt: '2026-09-01T12:00:00Z',
        enforcedBy: { id: 'u2', firstName: null, lastName: null, email: 'owner@acme.com' },
      }),
      isLoading: false,
      error: null,
    };
    domainRows = [domain('acme.com', 'verified')];
    memberRows = [
      { id: 'm1', status: 'accepted', email: 'one@acme.com' },
      { id: 'm2', status: 'accepted', email: 'two@acme.com' },
      { id: 'm3', status: 'accepted', email: 'guest@other.com' },
    ];

    renderCard();

    expect(screen.getByText('Required')).toBeTruthy();
    expect(screen.getByText('01/09/2026 by owner@acme.com')).toBeTruthy();
    expect(screen.getByText('2 active members')).toBeTruthy();

    fireEvent.click(screen.getByText('Stop requiring single sign-on'));
    fireEvent.click(screen.getByText('Stop requiring SSO'));

    expect(enforcementMutate).toHaveBeenCalledWith({
      organizationId: ORGANIZATION_ID,
      enforced: false,
    });
  });

  // 403 on the connection is the API saying this account lacks the super-admin grant, not that it
  // is no staff: the state is left out, and the entitlement switch — plain fields of the
  // workspace — still shows.
  it('shows no single sign-on state when the connection cannot be read', () => {
    connectionState = {
      data: undefined,
      isLoading: false,
      error: { httpCode: 403, error: 'Access denied' },
    };

    renderCard();

    expect(
      screen.getByText(
        'Where a workspace stands with single sign-on is visible to super admins only.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Protocol')).toBeNull();
    expect(screen.queryByText('Stop requiring single sign-on')).toBeNull();
    expect(screen.getByRole('switch')).toBeTruthy();
  });

  it('says a 404 is an entitled workspace that described no provider yet', () => {
    connectionState = {
      data: undefined,
      isLoading: false,
      error: { httpCode: 404, error: 'Not found' },
    };

    renderCard();

    expect(screen.getByText('No identity provider described yet.')).toBeTruthy();
  });
});
