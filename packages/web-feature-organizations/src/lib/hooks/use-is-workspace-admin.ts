import { useGetOrganizationMembers } from '@skeleton/core-api';
import { OrganizationMember } from '@skeleton/core-api-models';
import { useConnectedUser } from '@skeleton/core-store-session';
import { MEMBERS_COUNT_PAGE_LIMIT } from './use-members-count-page';

/** Structural, not `Pick<OrganizationMember, …>`: only the member's id is read off the user. */
type MemberForAdminCheck = {
  role: OrganizationMember['role'];
  status: OrganizationMember['status'];
  mfaEnabled: OrganizationMember['mfaEnabled'];
  user: { id: string } | null;
};

/**
 * Whether the connected user administers the workspace, read off the fetched member page. There is
 * no permission hook in the UI: the role comes from the user's own member row and, should that row
 * be past the page, from `mfaEnabled`, which the API fills for workspace admins only. Either way
 * the API is the real gate — this only decides what the settings pages offer.
 */
export function isWorkspaceAdminInMembers(
  members: MemberForAdminCheck[],
  userId: string | null | undefined,
): boolean {
  const ownMember = members.find(
    (member) => !!userId && member.user?.id === userId,
  );

  return ownMember
    ? ownMember.role === 'admin' && ownMember.status === 'accepted'
    : members.some((member) => member.mfaEnabled != null);
}

/**
 * {@link isWorkspaceAdminInMembers} over one page of the workspace's members. The page is returned
 * with it so that a caller needing the same rows — the security page counts the members without
 * two-factor authentication on them — makes no second request.
 *
 * `isPending`, not `isLoading`: the query stays disabled until the session user is known, and it is
 * exactly then that nothing says yet whether this person is an admin — a caller must wait rather
 * than show the state of a non-admin. A failed query is not pending either, so an error does not
 * leave a page checking forever.
 */
export function useIsWorkspaceAdmin(organizationId: string | undefined) {
  const connectedUser = useConnectedUser();
  const userId = connectedUser?.id;

  const { data: members, isPending } = useGetOrganizationMembers(
    {
      staticParams: { organizationId: organizationId ?? '' },
      offset: 0,
      limit: MEMBERS_COUNT_PAGE_LIMIT,
      // `email` is not read by the derivation below: it is what a caller counts on (who is on a
      // verified domain), and asking for it here spares them a second request for the same page.
      fields: {
        id: null,
        role: null,
        status: null,
        email: null,
        mfaEnabled: null,
        user: { fields: { id: null } },
      },
    },
    { enabled: !!organizationId && !!userId },
  );

  const memberRows = members?.data ?? [];

  return {
    isWorkspaceAdmin: isWorkspaceAdminInMembers(memberRows, userId),
    isPending,
    members: memberRows,
    membersTotalCount: members?.pagination.count ?? 0,
  };
}
