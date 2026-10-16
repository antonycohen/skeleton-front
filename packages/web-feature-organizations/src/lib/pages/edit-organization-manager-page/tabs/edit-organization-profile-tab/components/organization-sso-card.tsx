import { ReactNode, useState } from 'react';
import { useGetSsoConnection, useGetSsoDomains } from '@skeleton/core-api';
import { ReadSsoDomain, SsoConnectionStatus } from '@skeleton/core-api-models';
import { cn } from '@skeleton/core-utils';
import {
  Badge,
  BadgeStatus,
  BadgeStatusVariant,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Skeleton,
  Switch,
} from '@skeleton/web-components';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';
import {
  SSO_DOMAINS_LIMIT,
  useMembersOnVerifiedDomainsCount,
} from '../../../../../hooks/use-members-on-verified-domains-count';
import { SsoEnforcementModal } from '../../../../../modals/sso-enforcement-modal';
import { OrganizationSsoAvailabilityModal } from './organization-sso-availability-modal';

const statusBadges: Record<
  SsoConnectionStatus,
  { labelKey: string; variant: BadgeStatusVariant }
> = {
  draft: { labelKey: 'adminOrganizations.sso.status.draft', variant: 'yellow' },
  tested: { labelKey: 'adminOrganizations.sso.status.tested', variant: 'blue' },
  enabled: { labelKey: 'adminOrganizations.sso.status.enabled', variant: 'green' },
  enforced: { labelKey: 'adminOrganizations.sso.status.enforced', variant: 'green' },
};

const protocolLabels: Record<string, string> = {
  oidc: 'OpenID Connect',
  saml: 'SAML 2.0',
};

const formatDay = (value: string | null | undefined) =>
  value ? format(new Date(value), 'dd/MM/yyyy') : null;

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-t py-3 first:border-t-0">
    <span className="text-sm font-medium">{label}</span>
    <div className="text-right text-sm text-muted-foreground">{children}</div>
  </div>
);

const DomainList = ({ domains }: { domains: ReadSsoDomain[] }) => (
  <div className="flex flex-wrap justify-end gap-1">
    {domains.map((domain) => (
      <Badge key={domain.id} variant="outline">
        {domain.domain}
      </Badge>
    ))}
  </div>
);

/**
 * What the workspace has done with single sign-on, read-only. Split out so that its three reads
 * only happen once the workspace is entitled: without the entitlement every one of them is a 404.
 */
const OrganizationSsoState = ({ organizationId }: { organizationId: string }) => {
  const { t } = useTranslation();
  // The state the enforcement dialog is about to apply, `null` while it is closed. Only `false`
  // ever reaches it: staff lift a requirement, they never set one (the API answers 403).
  const [isLifting, setIsLifting] = useState(false);

  // Only the fields rendered below: no secret, no PEM, nothing the operator has no business
  // reading. `nearestCertificateExpiry` saves a read of the certificates themselves.
  const {
    data: connection,
    isLoading: isConnectionLoading,
    error: connectionError,
  } = useGetSsoConnection({
    organizationId,
    fields: {
      id: null,
      protocol: null,
      status: null,
      nearestCertificateExpiry: null,
      lastTestedAt: null,
      lastTestedBy: { fields: { id: null, email: null } },
      enforcedAt: null,
      enforcedBy: { fields: { id: null, email: null } },
    },
  });

  // Same parameters as `useMembersOnVerifiedDomainsCount` reads them with, so both hooks share one
  // query and the domains travel once.
  const { data: domains } = useGetSsoDomains({
    staticParams: { organizationId },
    offset: 0,
    limit: SSO_DOMAINS_LIMIT,
    fields: { id: null, domain: null, status: null },
  });

  const { membersOnVerifiedDomainsCount, membersCountIsPartial } =
    useMembersOnVerifiedDomainsCount(organizationId);

  if (isConnectionLoading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  // A 403 is the API saying this account does not hold `security:sso:read`, which comes through the
  // super-admin alias alone: the state is not theirs to see, and retrying changes nothing. A 404
  // means the workspace described no provider yet — it is entitled, or this block would not render.
  if (connectionError) {
    return (
      <p className="border-t pt-4 text-sm text-muted-foreground">
        {connectionError.httpCode === 403
          ? t('adminOrganizations.sso.state.forbidden')
          : connectionError.httpCode === 404
            ? t('adminOrganizations.sso.state.notConfigured')
            : t('adminOrganizations.sso.state.readError', {
                error: connectionError.error,
              })}
      </p>
    );
  }

  const status = connection?.status ?? null;
  const badge = status ? statusBadges[status] : null;
  const domainRows = domains?.data ?? [];
  const verifiedDomains = domainRows.filter(
    (domain) => domain.status === 'verified',
  );
  const suspendedDomains = domainRows.filter(
    (domain) => domain.status === 'suspended',
  );
  const lastTestedOn = formatDay(connection?.lastTestedAt);
  const enforcedOn = formatDay(connection?.enforcedAt);
  const certificateExpiry = formatDay(connection?.nearestCertificateExpiry);

  return (
    <>
      <div className="flex flex-col border-t pt-2">
        <Row label={t('adminOrganizations.sso.state.protocol')}>
          {connection?.protocol
            ? (protocolLabels[connection.protocol] ?? connection.protocol)
            : '-'}
        </Row>
        <Row label={t('adminOrganizations.sso.state.status')}>
          {badge ? (
            <BadgeStatus variant={badge.variant}>
              {t(badge.labelKey)}
            </BadgeStatus>
          ) : (
            '-'
          )}
        </Row>
        <Row label={t('adminOrganizations.sso.state.verifiedDomains')}>
          {verifiedDomains.length ? (
            <DomainList domains={verifiedDomains} />
          ) : (
            t('common.none')
          )}
        </Row>
        {suspendedDomains.length > 0 && (
          // The DNS record went missing on three daily checks: the domain stops routing, and comes
          // back by itself once the record is published again.
          <Row label={t('adminOrganizations.sso.state.suspendedDomains')}>
            <DomainList domains={suspendedDomains} />
          </Row>
        )}
        <Row label={t('adminOrganizations.sso.state.lastTest')}>
          {lastTestedOn
            ? connection?.lastTestedBy?.email
              ? t('adminOrganizations.sso.state.dateBy', {
                  date: lastTestedOn,
                  email: connection.lastTestedBy.email,
                })
              : lastTestedOn
            : t('adminOrganizations.sso.state.never')}
        </Row>
        {status === 'enforced' && (
          <Row label={t('adminOrganizations.sso.state.requiredSince')}>
            {enforcedOn
              ? connection?.enforcedBy?.email
                ? t('adminOrganizations.sso.state.dateBy', {
                    date: enforcedOn,
                    email: connection.enforcedBy.email,
                  })
                : enforcedOn
              : t('adminOrganizations.sso.state.unknown')}
          </Row>
        )}
        {status === 'enforced' && membersOnVerifiedDomainsCount !== null && (
          <Row label={t('adminOrganizations.sso.state.membersConcerned')}>
            {membersCountIsPartial
              ? t('adminOrganizations.sso.state.activeMembersAtLeast', {
                  count: membersOnVerifiedDomainsCount,
                })
              : t('adminOrganizations.sso.state.activeMembers', {
                  count: membersOnVerifiedDomainsCount,
                })}
          </Row>
        )}
        {connection?.protocol === 'saml' && (
          <Row label={t('adminOrganizations.sso.state.nextCertificateExpiry')}>
            {certificateExpiry ??
              t('adminOrganizations.sso.state.noCertificate')}
          </Row>
        )}
      </div>

      {/* Support can lift a requirement that locks a workspace out, and nothing else: the API
          answers 403 on every other write of the connection, so no other action is offered. */}
      {status === 'enforced' && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsLifting(true)}
          >
            {t('adminOrganizations.sso.state.stopRequiring')}
          </Button>
        </div>
      )}

      {isLifting && (
        <SsoEnforcementModal
          open
          onOpenChange={setIsLifting}
          organizationId={organizationId}
          enforced={false}
          surface="back-office"
          membersOnVerifiedDomainsCount={membersOnVerifiedDomainsCount}
          membersCountIsPartial={membersCountIsPartial}
        />
      )}
    </>
  );
};

type OrganizationSsoCardProps = {
  className?: string;
  organizationId: string;
  ssoAvailable: boolean | null | undefined;
};

/**
 * Back-office switch of a workspace's enterprise single sign-on entitlement, with the state the
 * workspace has reached under it. A super admin makes it available — the workspace's Security page
 * then offers the settings instead of an upsell — and may lift a requirement that locks its admins
 * out. Requiring single sign-on stays the workspace's own act (the API answers 403), so the card
 * never offers it.
 */
export const OrganizationSsoCard = ({
  className,
  organizationId,
  ssoAvailable,
}: OrganizationSsoCardProps) => {
  const { t } = useTranslation();
  // The entitlement the open dialog is about to apply, `null` while it is closed
  const [pendingAvailable, setPendingAvailable] = useState<boolean | null>(null);

  return (
    <>
      <Card className={cn('rounded-2xl', className)}>
        <CardHeader>
          <CardTitle className="text-xl">
            {t('adminOrganizations.sso.title')}
          </CardTitle>
          <CardDescription>
            {t('adminOrganizations.sso.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="organization-sso-available"
                className="text-sm font-medium"
              >
                {t('adminOrganizations.sso.availableLabel')}
              </Label>
              <span className="text-sm text-muted-foreground">
                {t('adminOrganizations.sso.availableHint')}
              </span>
            </div>
            <Switch
              id="organization-sso-available"
              checked={ssoAvailable ?? false}
              disabled={ssoAvailable == null}
              onCheckedChange={(checked) => setPendingAvailable(checked)}
            />
          </div>

          {ssoAvailable && (
            <OrganizationSsoState organizationId={organizationId} />
          )}
        </CardContent>
      </Card>

      {pendingAvailable !== null && (
        <OrganizationSsoAvailabilityModal
          open
          onOpenChange={(open) => !open && setPendingAvailable(null)}
          organizationId={organizationId}
          available={pendingAvailable}
        />
      )}
    </>
  );
};
