import { describe, expect, it } from 'vitest';
import {
  countMembersOnVerifiedDomains,
  verifiedDomainNames,
} from './use-members-on-verified-domains-count';

describe('countMembersOnVerifiedDomains', () => {
  it('counts the accepted members whose address is on a verified domain', () => {
    const members = [
      { status: 'accepted' as const, email: 'ada@acme.com' },
      { status: 'accepted' as const, email: 'grace@ACME.com' },
      { status: 'accepted' as const, email: 'guest@other.com' },
    ];

    expect(countMembersOnVerifiedDomains(members, ['acme.com'], 3)).toEqual({
      membersOnVerifiedDomainsCount: 2,
      membersCountIsPartial: false,
    });
  });

  it('leaves out the members who are not accepted', () => {
    const members = [
      { status: 'invited' as const, email: 'ada@acme.com' },
      { status: 'suspended' as const, email: 'grace@acme.com' },
    ];

    expect(
      countMembersOnVerifiedDomains(members, ['acme.com'], 2).membersOnVerifiedDomainsCount,
    ).toBe(0);
  });

  // The API routes on the exact domain: proving acme.com does not prove a subdomain, which is
  // claimed on its own.
  it('matches the domain exactly, subdomains excluded', () => {
    const members = [
      { status: 'accepted' as const, email: 'ada@mail.acme.com' },
      { status: 'accepted' as const, email: null },
    ];

    expect(
      countMembersOnVerifiedDomains(members, ['acme.com'], 2).membersOnVerifiedDomainsCount,
    ).toBe(0);
  });

  it('is unknown, not zero, while the verified domains are unknown', () => {
    const members = [{ status: 'accepted' as const, email: 'ada@acme.com' }];

    expect(countMembersOnVerifiedDomains(members, null, 1)).toEqual({
      membersOnVerifiedDomainsCount: null,
      membersCountIsPartial: false,
    });
    expect(
      countMembersOnVerifiedDomains(members, [], 1).membersOnVerifiedDomainsCount,
    ).toBe(0);
  });

  it('is a lower bound when the workspace has more members than the page fetched', () => {
    const members = [{ status: 'accepted' as const, email: 'ada@acme.com' }];

    expect(countMembersOnVerifiedDomains(members, ['acme.com'], 250)).toEqual({
      membersOnVerifiedDomainsCount: 1,
      membersCountIsPartial: true,
    });
  });
});

describe('verifiedDomainNames', () => {
  it('keeps the verified domains only, and is null while the list is unknown', () => {
    expect(
      verifiedDomainNames([
        { domain: 'acme.com', status: 'verified' },
        { domain: 'pending.com', status: 'pending' },
        { domain: 'gone.com', status: 'suspended' },
      ]),
    ).toEqual(['acme.com']);
    expect(verifiedDomainNames(undefined)).toBeNull();
  });
});
