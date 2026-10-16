import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SsoAdminOnlyCard } from './sso-admin-only-card';

describe('SsoAdminOnlyCard', () => {
  it('tells a member the workspace requires single sign-on, and that admins own the setting', () => {
    render(<SsoAdminOnlyCard status="enforced" />);

    expect(screen.getByText('Required')).toBeTruthy();
    expect(screen.getByText(/must sign in through the identity provider/)).toBeTruthy();
    expect(screen.getByText('Only workspace admins can change this setting.')).toBeTruthy();
  });

  it('says nothing is set up when the workspace has no connection', () => {
    render(<SsoAdminOnlyCard status="none" />);

    expect(screen.getByText('Not set up')).toBeTruthy();
  });

  it('shows no state while the organization has not answered', () => {
    render(<SsoAdminOnlyCard status={null} />);

    expect(screen.queryByText('Not set up')).toBeNull();
    expect(screen.getByText('Only workspace admins can change this setting.')).toBeTruthy();
  });
});
