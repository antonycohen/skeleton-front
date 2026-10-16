import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const mutate = vi.fn();
let mutationState: { isPending: boolean; error: { error: string } | null } = {
  isPending: false,
  error: null,
};
const toastSuccess = vi.fn();
let capturedOnSuccess: (() => void) | undefined;

vi.mock('@skeleton/core-api', () => ({
  useUpdateOrganizationSsoAvailability: (options?: { onSuccess?: () => void }) => {
    capturedOnSuccess = options?.onSuccess;
    return { mutate, ...mutationState };
  },
}));

vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}));

const { OrganizationSsoAvailabilityModal } = await import(
  './organization-sso-availability-modal'
);

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';

beforeEach(() => {
  vi.clearAllMocks();
  mutationState = { isPending: false, error: null };
  capturedOnSuccess = undefined;
});

describe('OrganizationSsoAvailabilityModal', () => {
  it('says what the workspace gains, and grants it on confirmation', () => {
    render(
      <OrganizationSsoAvailabilityModal
        open
        onOpenChange={vi.fn()}
        organizationId={ORGANIZATION_ID}
        available
      />,
    );

    expect(screen.getByText(/single sign-on settings on their Security page/)).toBeTruthy();

    fireEvent.click(screen.getByText('Make available'));

    expect(mutate).toHaveBeenCalledWith({
      organizationId: ORGANIZATION_ID,
      available: true,
    });
  });

  // A withdrawal is not just hiding the settings: `SsoConnectionGate#isUsable` asks for the
  // entitlement on every sign-in, so the identity provider stops answering at once.
  it('says a withdrawal stops the identity provider, and that the rows survive it', () => {
    const onOpenChange = vi.fn();
    render(
      <OrganizationSsoAvailabilityModal
        open
        onOpenChange={onOpenChange}
        organizationId={ORGANIZATION_ID}
        available={false}
      />,
    );

    expect(
      screen.getByText(/The identity provider stops letting anyone in at once/),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /sign in with a password or a social account again, and those already signed in through it stay signed in/,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(/kept as they are, so making it available again restores them/),
    ).toBeTruthy();

    fireEvent.click(screen.getByText('Cancel'));
    expect(mutate).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText('Withdraw'));
    expect(mutate).toHaveBeenCalledWith({
      organizationId: ORGANIZATION_ID,
      available: false,
    });
  });

  it('closes on success and says so', () => {
    const onOpenChange = vi.fn();
    render(
      <OrganizationSsoAvailabilityModal
        open
        onOpenChange={onOpenChange}
        organizationId={ORGANIZATION_ID}
        available
      />,
    );

    capturedOnSuccess?.();

    expect(toastSuccess).toHaveBeenCalledWith(
      'Single sign-on is available to this workspace',
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // Withdrawing while the workspace's connection is enforced is a 409 naming the way out, so the
  // dialog stays open with it instead of closing on a toast the operator reads too late.
  it('stays open on the API refusal and shows its message', () => {
    mutationState = {
      isPending: false,
      error: {
        error:
          'Lift the single sign-on requirement of this workspace before withdrawing its SSO availability',
      },
    };
    const onOpenChange = vi.fn();

    render(
      <OrganizationSsoAvailabilityModal
        open
        onOpenChange={onOpenChange}
        organizationId={ORGANIZATION_ID}
        available={false}
      />,
    );

    expect(
      screen.getByText(
        'Lift the single sign-on requirement of this workspace before withdrawing its SSO availability',
      ),
    ).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
