import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
} from '@skeleton/web-components';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { useMembersWithoutMfaCount } from '../../../../../hooks/use-members-without-mfa-count';
import { MfaRequirementModal } from '../../../../../modals/mfa-requirement-modal';

type OrganizationMfaRequirementCardProps = {
  className?: string;
  organizationId: string;
  mfaRequired: boolean | null | undefined;
};

/**
 * Back-office switch of the workspace's two-factor authentication requirement. A super admin may
 * flip it for any workspace; requiring it still takes 2FA on their own account (409 otherwise,
 * the modal shows the API message). The API shows a super admin which members lack 2FA, as it
 * does to the workspace's own admins, so the confirmation can say how many will have to act.
 */
export const OrganizationMfaRequirementCard = ({
  className,
  organizationId,
  mfaRequired,
}: OrganizationMfaRequirementCardProps) => {
  const { t } = useTranslation();
  // The requirement the open dialog is about to apply, `null` while it is closed
  const [pendingRequired, setPendingRequired] = useState<boolean | null>(null);
  const { membersWithoutMfaCount, membersCountIsPartial } =
    useMembersWithoutMfaCount(organizationId);

  return (
    <>
      <Card className={cn('rounded-2xl', className)}>
        <CardHeader>
          <CardTitle className="text-xl">
            {t('adminOrganizations.mfa.title')}
          </CardTitle>
          <CardDescription>
            {t('adminOrganizations.mfa.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="organization-mfa-required" className="text-sm font-medium">
              {t('adminOrganizations.mfa.requireLabel')}
            </Label>
            <span className="text-sm text-muted-foreground">
              {t('adminOrganizations.mfa.requireHint')}
            </span>
          </div>
          <Switch
            id="organization-mfa-required"
            checked={mfaRequired ?? false}
            disabled={mfaRequired == null}
            onCheckedChange={(checked) => setPendingRequired(checked)}
          />
        </CardContent>
      </Card>

      {pendingRequired !== null && (
        <MfaRequirementModal
          open
          onOpenChange={(open) => !open && setPendingRequired(null)}
          organizationId={organizationId}
          required={pendingRequired}
          membersWithoutMfaCount={membersWithoutMfaCount}
          membersCountIsPartial={membersCountIsPartial}
        />
      )}
    </>
  );
};
