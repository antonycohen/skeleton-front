import { useState } from 'react';
import { useTranslation } from '@skeleton/core-translations';
import { Link } from 'react-router-dom';
import { useGetOrganizationById, useGetUserMfaStatus } from '@skeleton/core-api';
import { useConnectedUser } from '@skeleton/core-store-session';
import { useCurrentWorkspaceUrlPrefix, useGetCurrentWorkspaceId } from '@skeleton/core-workspace';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
} from '@skeleton/web-components';
import { LayoutContent, LayoutHeader, LayoutTopbar } from '@skeleton/web-layout';
import { IconShieldCheck, IconShieldOff } from '@tabler/icons-react';
import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import { useIsWorkspaceAdmin } from '../../hooks/use-is-workspace-admin';
import { countMembersWithoutMfa } from '../../hooks/use-members-without-mfa-count';
import { MfaRequirementModal } from '../../modals/mfa-requirement-modal';
import { SsoAdminOnlyCard } from './components/sso-admin-only-card';
import { SsoSection } from './components/sso-section';
import { SsoUpsellCard } from './components/sso-upsell-card';

export function EditSecurityPage() {
  const { t } = useTranslation();
  const organizationId = useGetCurrentWorkspaceId();
  const workspaceUrlPrefix = useCurrentWorkspaceUrlPrefix();
  const connectedUser = useConnectedUser();
  const userId = connectedUser?.id ?? '';
  // The requirement the open dialog is about to apply, `null` while it is closed
  const [pendingRequired, setPendingRequired] = useState<boolean | null>(null);

  const { data: organization, isLoading: isOrganizationLoading } = useGetOrganizationById(
    {
      id: organizationId ?? '',
      fields: { id: null, name: null, mfaRequired: null, ssoAvailable: null, ssoStatus: null },
    },
    { enabled: !!organizationId },
  );

  // One member page serves both cards: the role this admin holds, the 2FA coverage below, and the
  // count of people an enforced single sign-on takes over.
  const {
    isWorkspaceAdmin,
    isPending: isWorkspaceAdminPending,
    members: memberRows,
    membersTotalCount,
  } = useIsWorkspaceAdmin(organizationId);

  // `isPending`, not `isLoading`: the query stays disabled until the session user is known, and a
  // disabled query is not "loading" although nothing says yet whether this admin has 2FA. A
  // failed query is not pending either, so an error does not leave the page checking forever.
  const { data: ownMfaStatus, isPending: isOwnMfaStatusPending } = useGetUserMfaStatus(
    { userId },
    { enabled: !!userId },
  );

  if (!organizationId) {
    return <div>{t('security.page.noOrganization')}</div>;
  }

  // Counted on the list the admin derivation fetched rather than through
  // `useMembersWithoutMfaCount`, whose narrower `fields` would make it a second request.
  const { membersWithoutMfaCount, membersCountIsPartial } = countMembersWithoutMfa(
    memberRows,
    membersTotalCount,
  );

  const isLoading = isOrganizationLoading || isWorkspaceAdminPending || isOwnMfaStatusPending;
  const mfaRequired = organization?.mfaRequired ?? false;
  const ownMfaEnabled = ownMfaStatus?.enabled ?? false;
  // Requiring it takes an admin who has it (the API answers 409 otherwise); lifting it does not.
  const needsOwnMfaFirst = isWorkspaceAdmin && !mfaRequired && !ownMfaEnabled;
  const accountSecurityUrl = `${workspaceUrlPrefix}/settings/account/connexion`;
  // Not entitled: nothing about single sign-on is fetched, every one of those calls would be a 404.
  const ssoAvailable = organization?.ssoAvailable ?? false;

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar />
      </header>
      <LayoutContent>
        <LayoutHeader
          pageTitle={t('security.page.title')}
          pageDescription={
            organization?.name
              ? t('security.page.description', { name: organization.name })
              : t('security.page.descriptionFallback')
          }
        />
        <div className="flex max-w-4xl flex-col gap-8">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">{t('security.mfa.title')}</CardTitle>
              <CardDescription>{t('security.mfa.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3">
                  {mfaRequired ? (
                    <IconShieldCheck className="size-6 shrink-0 text-teal-600" />
                  ) : (
                    <IconShieldOff className="size-6 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex flex-col">
                    <Label htmlFor="workspace-mfa-required" className="font-semibold">
                      {t('security.mfa.requiredLabel')}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {isLoading
                        ? t('security.mfa.checking')
                        : mfaRequired
                          ? t('security.mfa.on')
                          : t('security.mfa.off')}
                    </span>
                  </div>
                </div>
                <Switch
                  id="workspace-mfa-required"
                  checked={mfaRequired}
                  disabled={isLoading || !isWorkspaceAdmin || needsOwnMfaFirst}
                  onCheckedChange={(checked) => setPendingRequired(checked)}
                />
              </div>

              {!isLoading && isWorkspaceAdmin && membersWithoutMfaCount !== null && (
                <div className="flex items-center justify-between gap-4 border-t py-3">
                  <span className="text-sm text-muted-foreground">
                    {membersWithoutMfaCount === 0 && !membersCountIsPartial
                      ? t('security.mfa.allMembersCovered')
                      : membersCountIsPartial
                        ? t('security.mfa.membersWithoutAtLeast', { count: membersWithoutMfaCount })
                        : t('security.mfa.membersWithout', { count: membersWithoutMfaCount })}
                  </span>
                  <Link
                    to={`${workspaceUrlPrefix}/settings/teams`}
                    className="shrink-0 text-sm underline"
                  >
                    {t('security.mfa.viewMembers')}
                  </Link>
                </div>
              )}

              {!isLoading && !isWorkspaceAdmin && (
                <Alert>
                  <InfoIcon />
                  <AlertDescription>{t('security.adminOnly')}</AlertDescription>
                </Alert>
              )}

              {!isLoading && needsOwnMfaFirst && (
                <Alert variant="important">
                  <TriangleAlertIcon />
                  <AlertTitle>{t('security.mfa.ownFirst.title')}</AlertTitle>
                  <AlertDescription>
                    <span>
                      {t('security.mfa.ownFirst.description')}{' '}
                      <Link to={accountSecurityUrl} className="underline">
                        {t('security.mfa.ownFirst.link')}
                      </Link>
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {!isOrganizationLoading && !ssoAvailable && <SsoUpsellCard />}

          {ssoAvailable &&
            !isWorkspaceAdminPending &&
            (isWorkspaceAdmin ? (
              <SsoSection
                organizationId={organizationId}
                members={memberRows}
                membersTotalCount={membersTotalCount}
              />
            ) : (
              <SsoAdminOnlyCard status={organization?.ssoStatus ?? null} />
            ))}
        </div>
      </LayoutContent>

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
    </div>
  );
}
