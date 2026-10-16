import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGetOrganizationMembers } from '@skeleton/core-api';
import { useMembersOnVerifiedDomainsCount } from './use-members-on-verified-domains-count';
import { useMembersWithoutMfaCount } from './use-members-without-mfa-count';

vi.mock('@skeleton/core-api', () => ({
  useGetOrganizationMembers: vi.fn(() => ({ data: undefined, isLoading: true })),
  useGetSsoDomains: vi.fn(() => ({ data: undefined, isLoading: true })),
}));

beforeEach(() => vi.clearAllMocks());

describe('useMembersCountPage', () => {
  // TanStack keys a query on its parameters: the same ones are the same request, any difference
  // (a narrower `fields`) is a second one for the same page.
  it('asks for the member page with the same parameters from both counts, so a screen showing both fetches it once', () => {
    renderHook(() => {
      useMembersWithoutMfaCount('org-1');
      useMembersOnVerifiedDomainsCount('org-1');
    });

    const calls = vi.mocked(useGetOrganizationMembers).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual(calls[0]);
    expect(calls[0][0].fields).toEqual({
      id: null,
      status: null,
      email: null,
      mfaEnabled: null,
    });
  });
});
