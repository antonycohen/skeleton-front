import { OrganizationMember } from '@skeleton/core-api-models';
import { useMembersCountPage } from './use-members-count-page';

/**
 * How many accepted members of a fetched page do not have two-factor authentication. The API fills
 * `mfaEnabled` for the workspace's admins and for back-office super admins only: for anyone else
 * the count is `null` (unknown), not zero. `totalCount` is the list's `X-Total-Count`.
 */
export function countMembersWithoutMfa(
  members: Pick<OrganizationMember, 'status' | 'mfaEnabled'>[],
  totalCount: number,
) {
  const acceptedMembers = members.filter((member) => member.status === 'accepted');
  const isCoverageVisible = acceptedMembers.some((member) => member.mfaEnabled != null);

  return {
    membersWithoutMfaCount: isCoverageVisible
      ? acceptedMembers.filter((member) => member.mfaEnabled === false).length
      : null,
    membersCountIsPartial: totalCount > members.length,
  };
}

/** {@link countMembersWithoutMfa} for a caller that has no member list of its own. */
export function useMembersWithoutMfaCount(organizationId: string) {
  const { data: members, isLoading } = useMembersCountPage(organizationId);

  return {
    isLoading,
    ...countMembersWithoutMfa(members?.data ?? [], members?.pagination.count ?? 0),
  };
}
