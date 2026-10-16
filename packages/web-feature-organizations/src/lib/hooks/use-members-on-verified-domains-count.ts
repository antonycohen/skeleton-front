import { useGetSsoDomains } from '@skeleton/core-api';
import { OrganizationMember, ReadSsoDomain } from '@skeleton/core-api-models';
import { useMembersCountPage } from './use-members-count-page';

/** One page is enough to count them; a longer list makes the count a lower bound. */
export const SSO_DOMAINS_LIMIT = 50;

/**
 * The addresses an enforced connection takes over: every active member whose e-mail domain is one
 * of the workspace's verified domains. The match is exact, like the API's routing — a verified
 * `acme.com` does not cover `mail.acme.com`, which is claimed on its own.
 *
 * `verifiedDomains` is `null` while they are unknown (still loading, or a viewer the API does not
 * show them to), and the count is then `null` — unknown, not zero. `totalCount` is the member
 * list's `X-Total-Count`.
 */
export function countMembersOnVerifiedDomains(
  members: Pick<OrganizationMember, 'status' | 'email'>[],
  verifiedDomains: string[] | null,
  totalCount: number,
) {
  if (verifiedDomains === null) {
    return {
      membersOnVerifiedDomainsCount: null,
      membersCountIsPartial: false,
    };
  }

  const domains = new Set(
    verifiedDomains.map((domain) => domain.toLowerCase()),
  );
  const count = members.filter(
    (member) =>
      member.status === 'accepted' &&
      !!member.email &&
      domains.has(member.email.toLowerCase().split('@')[1] ?? ''),
  ).length;

  return {
    membersOnVerifiedDomainsCount: count,
    membersCountIsPartial: totalCount > members.length,
  };
}

/** The verified domains of a fetched list, or `null` when the list itself is unknown. */
export function verifiedDomainNames(
  domains: Pick<ReadSsoDomain, 'domain' | 'status'>[] | undefined,
): string[] | null {
  return domains
    ? domains
        .filter((domain) => domain.status === 'verified' && !!domain.domain)
        .map((domain) => domain.domain as string)
    : null;
}

/**
 * {@link countMembersOnVerifiedDomains} for a caller that has neither list, which is every caller
 * of the enforcement dialog: it is surface-agnostic and takes only a workspace id.
 */
export function useMembersOnVerifiedDomainsCount(organizationId: string) {
  const { data: members, isLoading: areMembersLoading } =
    useMembersCountPage(organizationId);

  const { data: domains, isLoading: areDomainsLoading } = useGetSsoDomains(
    {
      staticParams: { organizationId },
      offset: 0,
      limit: SSO_DOMAINS_LIMIT,
      fields: { id: null, domain: null, status: null },
    },
    { enabled: !!organizationId },
  );

  return {
    isLoading: areMembersLoading || areDomainsLoading,
    ...countMembersOnVerifiedDomains(
      members?.data ?? [],
      verifiedDomainNames(domains?.data),
      members?.pagination.count ?? 0,
    ),
  };
}
