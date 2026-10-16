import { useGetOrganizationMembers } from '@skeleton/core-api';

/** One page is enough to count them; a longer list makes each count a lower bound. */
export const MEMBERS_COUNT_PAGE_LIMIT = 200;

/**
 * The page of a workspace's members the counts are taken on — who lacks two-factor authentication,
 * who is on a verified domain — for a screen that has no member list of its own.
 *
 * One set of parameters with every field those counts read, rather than one query per count with
 * only its own `fields`: TanStack keys a query on its parameters, so two narrower requests of the
 * same page would travel twice. The back office's workspace profile shows both counts and, through
 * this hook, fetches the page once.
 */
export function useMembersCountPage(organizationId: string) {
  return useGetOrganizationMembers(
    {
      staticParams: { organizationId },
      offset: 0,
      limit: MEMBERS_COUNT_PAGE_LIMIT,
      fields: { id: null, status: null, email: null, mfaEnabled: null },
    },
    { enabled: !!organizationId },
  );
}
