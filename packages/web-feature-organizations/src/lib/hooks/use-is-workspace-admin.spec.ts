import { describe, expect, it } from 'vitest';
import { isWorkspaceAdminInMembers } from './use-is-workspace-admin';

const USER_ID = 'a2c8e4a0-0000-4000-8000-000000000001';

describe('isWorkspaceAdminInMembers', () => {
  it('reads the role off the connected user own member row', () => {
    const members = [
      { role: 'editor' as const, status: 'accepted' as const, mfaEnabled: null, user: { id: 'other' } },
      { role: 'admin' as const, status: 'accepted' as const, mfaEnabled: null, user: { id: USER_ID } },
    ];

    expect(isWorkspaceAdminInMembers(members, USER_ID)).toBe(true);
  });

  it('is false for a member who is not an accepted admin', () => {
    const invitedAdmin = [
      { role: 'admin' as const, status: 'invited' as const, mfaEnabled: null, user: { id: USER_ID } },
    ];
    const editor = [
      { role: 'editor' as const, status: 'accepted' as const, mfaEnabled: null, user: { id: USER_ID } },
    ];

    expect(isWorkspaceAdminInMembers(invitedAdmin, USER_ID)).toBe(false);
    expect(isWorkspaceAdminInMembers(editor, USER_ID)).toBe(false);
  });

  // `mfaEnabled` is filled for the workspace's admins only: seeing it at all proves the role, which
  // is what covers an admin whose own row sits past the page that was fetched.
  it('falls back on the fields the API only shows admins when the own row is missing', () => {
    const withCoverage = [
      { role: 'editor' as const, status: 'accepted' as const, mfaEnabled: true, user: { id: 'other' } },
    ];
    const withoutCoverage = [
      { role: 'editor' as const, status: 'accepted' as const, mfaEnabled: null, user: { id: 'other' } },
    ];

    expect(isWorkspaceAdminInMembers(withCoverage, USER_ID)).toBe(true);
    expect(isWorkspaceAdminInMembers(withoutCoverage, USER_ID)).toBe(false);
  });

  it('is false while the connected user is unknown, and on an empty list', () => {
    const members = [
      { role: 'admin' as const, status: 'accepted' as const, mfaEnabled: null, user: { id: USER_ID } },
    ];

    expect(isWorkspaceAdminInMembers(members, undefined)).toBe(false);
    expect(isWorkspaceAdminInMembers([], USER_ID)).toBe(false);
  });
});
