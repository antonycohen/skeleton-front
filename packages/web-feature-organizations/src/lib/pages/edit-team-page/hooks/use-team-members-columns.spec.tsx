import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SsoLinkedCell } from './use-team-members-columns';

describe('SsoLinkedCell', () => {
  it('badges a member bound to the workspace connection', () => {
    render(<SsoLinkedCell member={{ ssoLinked: true }} />);

    expect(screen.getByText('SSO')).toBeTruthy();
  });

  it('shows a dash when the member never signed in through the connection', () => {
    render(<SsoLinkedCell member={{ ssoLinked: false }} />);

    expect(screen.queryByText('SSO')).toBeNull();
    expect(screen.getByText('-')).toBeTruthy();
  });

  it('shows a dash when the API hides the binding from the viewer', () => {
    render(<SsoLinkedCell member={{ ssoLinked: null }} />);

    expect(screen.queryByText('SSO')).toBeNull();
    expect(screen.getByText('-')).toBeTruthy();
  });
});
