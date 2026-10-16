import { describe, expect, it } from 'vitest';
import { countMembersWithoutMfa } from './use-members-without-mfa-count';

describe('countMembersWithoutMfa', () => {
  it('counts the accepted members without two-factor authentication', () => {
    const members = [
      { status: 'accepted' as const, mfaEnabled: true },
      { status: 'accepted' as const, mfaEnabled: false },
      { status: 'accepted' as const, mfaEnabled: false },
    ];

    expect(countMembersWithoutMfa(members, 3)).toEqual({
      membersWithoutMfaCount: 2,
      membersCountIsPartial: false,
    });
  });

  it('leaves out the members who are not accepted', () => {
    const members = [
      { status: 'accepted' as const, mfaEnabled: true },
      { status: 'invited' as const, mfaEnabled: false },
      { status: 'suspended' as const, mfaEnabled: false },
    ];

    expect(countMembersWithoutMfa(members, 3).membersWithoutMfaCount).toBe(0);
  });

  it('is unknown, not zero, when the API hides the coverage from the viewer', () => {
    const members = [
      { status: 'accepted' as const, mfaEnabled: null },
      { status: 'accepted' as const, mfaEnabled: null },
    ];

    expect(countMembersWithoutMfa(members, 2).membersWithoutMfaCount).toBeNull();
    expect(countMembersWithoutMfa([], 0).membersWithoutMfaCount).toBeNull();
  });

  it('is a lower bound when the workspace has more members than the page fetched', () => {
    const members = [{ status: 'accepted' as const, mfaEnabled: false }];

    expect(countMembersWithoutMfa(members, 250)).toEqual({
      membersWithoutMfaCount: 1,
      membersCountIsPartial: true,
    });
  });
});
