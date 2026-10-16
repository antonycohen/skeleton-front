import type { UserStatus } from '@skeleton/core-api-models';
import { BadgeStatus, type BadgeStatusVariant } from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';

const statusVariants: Record<UserStatus, BadgeStatusVariant> = {
  ACTIVE: 'green',
  PENDING: 'yellow',
  INVITED: 'blue',
  DELETED: 'red',
};

const statusLabels: Record<UserStatus, { i18nKey: string }> = {
  ACTIVE: { i18nKey: 'adminUsers.status.active' },
  PENDING: { i18nKey: 'adminUsers.status.pending' },
  INVITED: { i18nKey: 'adminUsers.status.invited' },
  DELETED: { i18nKey: 'adminUsers.status.deleted' },
};

/**
 * Renders a user's status. Falls back to a plain dash for a missing status, or
 * for a value the API added that this front end doesn't know about yet.
 */
export function UserStatusBadge({ status }: { status: UserStatus | null | undefined }) {
  const { t } = useTranslation();
  if (!status || !statusVariants[status]) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <BadgeStatus variant={statusVariants[status]}>{t(statusLabels[status].i18nKey)}</BadgeStatus>
  );
}
