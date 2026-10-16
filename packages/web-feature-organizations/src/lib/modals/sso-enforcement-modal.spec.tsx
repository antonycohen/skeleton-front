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
  useUpdateSsoConnectionEnforcement: (options?: { onSuccess?: () => void }) => {
    capturedOnSuccess = options?.onSuccess;
    return { mutate, ...mutationState };
  },
}));

vi.mock('sonner', () => ({ toast: { success: (...args: unknown[]) => toastSuccess(...args) } }));

const { SsoEnforcementModal } = await import('./sso-enforcement-modal');

const ORGANIZATION_ID = 'b7d1f3c2-0000-4000-8000-000000000001';

beforeEach(() => {
  vi.clearAllMocks();
  mutationState = { isPending: false, error: null };
  capturedOnSuccess = undefined;
});

describe('SsoEnforcementModal', () => {
  it('states how many members the identity provider takes over, and what stops working', () => {
    render(
      <SsoEnforcementModal
        open
        onOpenChange={vi.fn()}
        organizationId={ORGANIZATION_ID}
        enforced
        membersOnVerifiedDomainsCount={3}
      />,
    );

    expect(
      screen.getByText(/3 active members on your verified domains will sign in/),
    ).toBeTruthy();
    expect(screen.getByText(/Passwords, password resets, social sign-in/)).toBeTruthy();
    expect(
      screen.getByText(/Guests on other domains, service accounts and AI assistants/),
    ).toBeTruthy();
  });

  it('says "at least" when the count was made on one page of a longer list', () => {
    render(
      <SsoEnforcementModal
        open
        onOpenChange={vi.fn()}
        organizationId={ORGANIZATION_ID}
        enforced
        membersOnVerifiedDomainsCount={1}
        membersCountIsPartial
      />,
    );

    expect(screen.getByText(/At least 1 active member/)).toBeTruthy();
  });

  it('requires single sign-on on confirmation', () => {
    render(
      <SsoEnforcementModal
        open
        onOpenChange={vi.fn()}
        organizationId={ORGANIZATION_ID}
        enforced
        membersOnVerifiedDomainsCount={0}
      />,
    );

    fireEvent.click(screen.getByText('Require SSO'));

    expect(mutate).toHaveBeenCalledWith({ organizationId: ORGANIZATION_ID, enforced: true });
  });

  it('lifts the requirement, and changes nothing on cancel', () => {
    const onOpenChange = vi.fn();
    render(
      <SsoEnforcementModal
        open
        onOpenChange={onOpenChange}
        organizationId={ORGANIZATION_ID}
        enforced={false}
      />,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mutate).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText('Stop requiring SSO'));
    expect(mutate).toHaveBeenCalledWith({ organizationId: ORGANIZATION_ID, enforced: false });
  });

  it('closes on success and says so', () => {
    const onOpenChange = vi.fn();
    render(
      <SsoEnforcementModal
        open
        onOpenChange={onOpenChange}
        organizationId={ORGANIZATION_ID}
        enforced
      />,
    );

    capturedOnSuccess?.();

    expect(toastSuccess).toHaveBeenCalledWith('Single sign-on is now required');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // The workspace wording says "your provider"; the back office acts on someone else's workspace
  // and answers to a support procedure, so the lift reads differently there — and only there.
  it('keeps the workspace wording of a lift to itself', () => {
    render(
      <SsoEnforcementModal
        open
        onOpenChange={vi.fn()}
        organizationId={ORGANIZATION_ID}
        enforced={false}
      />,
    );

    expect(screen.getByText(/People on your verified domains/)).toBeTruthy();
    expect(screen.queryByText(/support procedure/)).toBeNull();
  });

  it('recalls the identity check, and counts the members, when the back office lifts', () => {
    render(
      <SsoEnforcementModal
        open
        onOpenChange={vi.fn()}
        organizationId={ORGANIZATION_ID}
        enforced={false}
        surface="back-office"
        membersOnVerifiedDomainsCount={4}
      />,
    );

    expect(
      screen.getByText(/4 active members on this workspace's verified domains/),
    ).toBeTruthy();
    expect(screen.getByText(/verified the requester's identity through the support procedure/))
      .toBeTruthy();
    expect(screen.getByText(/recorded against your account/)).toBeTruthy();
  });

  // The API refuses an admin whose own session did not come through the connection (409, 5508).
  // Its message is the instruction, so the dialog stays open and shows it.
  it('stays open on the API refusal and shows its message', () => {
    mutationState = {
      isPending: false,
      error: { error: 'Sign in through your identity provider first, then come back' },
    };
    const onOpenChange = vi.fn();

    render(
      <SsoEnforcementModal
        open
        onOpenChange={onOpenChange}
        organizationId={ORGANIZATION_ID}
        enforced
      />,
    );

    expect(
      screen.getByText('Sign in through your identity provider first, then come back'),
    ).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
