import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReadSsoConnection, SsoConnectionStatus } from '@skeleton/core-api-models';
import { SsoStatusCard } from './sso-status-card';

const handlers = () => ({
  onTest: vi.fn(),
  onEnable: vi.fn(),
  onDisable: vi.fn(),
  onEnforcementChange: vi.fn(),
});

const connection = (
  status: SsoConnectionStatus,
  extra: Partial<ReadSsoConnection> = {},
): ReadSsoConnection =>
  ({
    id: 'c0000000-0000-4000-8000-000000000001',
    protocol: 'oidc',
    status,
    ...extra,
  }) as ReadSsoConnection;

const renderCard = (
  props: Partial<Parameters<typeof SsoStatusCard>[0]> & {
    connection?: ReadSsoConnection;
  } = {},
) => {
  const actions = handlers();
  render(
    <SsoStatusCard
      connection={props.connection}
      isLoading={false}
      hasVerifiedDomain
      isTesting={false}
      isUpdatingEnablement={false}
      {...actions}
      {...props}
    />,
  );
  return actions;
};

beforeEach(() => vi.clearAllMocks());

describe('SsoStatusCard', () => {
  it.each([
    ['draft', 'Draft'],
    ['tested', 'Tested'],
    ['enabled', 'Enabled'],
    ['enforced', 'Required'],
  ] as const)('names the %s state in a badge', (status, label) => {
    renderCard({ connection: connection(status) });

    expect(screen.getByText(label)).toBeTruthy();
  });

  it('says a saved draft is a draft', () => {
    renderCard({ connection: connection('draft') });

    expect(
      screen.getByText('Saved as a draft: run a test sign-in to go on.'),
    ).toBeTruthy();
  });

  it('shows no badge before any connection is described', () => {
    renderCard({ connection: undefined });

    expect(screen.queryByText('Draft')).toBeNull();
  });

  it('offers the test sign-in on a draft, and nothing else', () => {
    const { onTest } = renderCard({ connection: connection('draft') });

    expect(screen.queryByText('Enable')).toBeNull();
    expect(screen.queryByText('Disable')).toBeNull();
    fireEvent.click(screen.getByText('Test sign-in'));
    expect(onTest).toHaveBeenCalled();
  });

  it('offers enabling a tested connection, and still a new test', () => {
    const { onEnable } = renderCard({
      connection: connection('tested', {
        lastTestedAt: '2026-09-20T10:00:00Z',
        lastTestedBy: { id: 'u1', email: 'ada@acme.com' } as ReadSsoConnection['lastTestedBy'],
      }),
    });

    expect(screen.getByText(/Last successful test on 20\/09\/2026 by ada@acme.com/)).toBeTruthy();
    expect(screen.getByText('Test sign-in')).toBeTruthy();
    fireEvent.click(screen.getByText('Enable'));
    expect(onEnable).toHaveBeenCalled();
  });

  // The API refuses enabling without one (409): say what is missing instead of failing on click.
  it('holds enabling back until a domain is verified', () => {
    const { onEnable } = renderCard({
      connection: connection('tested'),
      hasVerifiedDomain: false,
    });

    const enable = screen.getByText('Enable').closest('button');
    expect(enable?.disabled).toBe(true);
    expect(screen.getByText(/Verify one e-mail domain first/)).toBeTruthy();
    expect(onEnable).not.toHaveBeenCalled();
  });

  it('offers disabling an enabled connection, and the requirement switch', () => {
    const { onDisable, onEnforcementChange } = renderCard({
      connection: connection('enabled'),
    });

    expect(screen.queryByText('Test sign-in')).toBeNull();
    fireEvent.click(screen.getByText('Disable'));
    expect(onDisable).toHaveBeenCalled();

    const requirement = screen.getByRole('switch');
    expect(requirement.getAttribute('data-state')).toBe('unchecked');
    fireEvent.click(requirement);
    expect(onEnforcementChange).toHaveBeenCalledWith(true);
  });

  // Disabling an enforced connection is refused (409): the requirement is lifted first, which the
  // switch does.
  it('leaves an enforced connection only the switch that lifts the requirement', () => {
    const { onEnforcementChange } = renderCard({
      connection: connection('enforced', { enforcedAt: '2026-09-21T10:00:00Z' }),
    });

    expect(screen.queryByText('Disable')).toBeNull();
    expect(screen.queryByText('Test sign-in')).toBeNull();
    expect(screen.getByText(/Required since 21\/09\/2026/)).toBeTruthy();

    const requirement = screen.getByRole('switch');
    expect(requirement.getAttribute('data-state')).toBe('checked');
    fireEvent.click(requirement);
    expect(onEnforcementChange).toHaveBeenCalledWith(false);
  });

  it('points at the identity provider card while there is no connection', () => {
    renderCard({ connection: undefined });

    expect(screen.getByText(/Fill in the identity provider card above/)).toBeTruthy();
    expect(screen.queryByText('Test sign-in')).toBeNull();
    expect(screen.getByRole('switch').getAttribute('data-disabled')).not.toBeNull();
  });
});
