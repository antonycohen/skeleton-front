import { useMemo, useState } from 'react';
import {
  useGetSsoConnection,
  useGetSsoDomains,
  useUpdateSsoConnectionEnablement,
} from '@skeleton/core-api';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { Alert, AlertDescription } from '@skeleton/web-components';
import { TriangleAlertIcon } from 'lucide-react';
import { OrganizationMember } from '@skeleton/core-api-models';
import {
  countMembersOnVerifiedDomains,
  SSO_DOMAINS_LIMIT,
  verifiedDomainNames,
} from '../../../hooks/use-members-on-verified-domains-count';
import { SsoEnforcementModal } from '../../../modals/sso-enforcement-modal';
import { useSsoTestSignIn } from '../hooks/use-sso-test-sign-in';
import { SsoCertificatesCard } from './sso-certificates-card';
import { SsoIdentityProviderCard } from './sso-identity-provider-card';
import { SsoProvisioningCard } from './sso-provisioning-card';
import { SsoStatusCard } from './sso-status-card';
import { SsoVerifiedDomainsCard } from './sso-verified-domains-card';

export type SsoSectionProps = {
  organizationId: string;
  /**
   * The page of members the page already fetched. The enforcement dialog states how many people an
   * enforced connection takes over, and counting them here costs no extra request — a caller with
   * no list of its own has `useMembersOnVerifiedDomainsCount` instead.
   */
  members: Pick<OrganizationMember, 'status' | 'email'>[];
  membersTotalCount: number;
};

/**
 * The single sign-on part of the security page, for a workspace that is entitled to it. The cards
 * follow the order of the work: prove your domains, describe your provider, walk the connection to
 * required, then decide what a sign-in grants.
 *
 * Rendered for the workspace's admins only — everybody else gets `SsoAdminOnlyCard`, since the API
 * refuses them every read of the connection — so no control here is ever read-only.
 */
export function SsoSection({
  organizationId,
  members,
  membersTotalCount,
}: SsoSectionProps) {
  const { t } = useTranslation();
  // The state the enforcement dialog is about to apply, `null` while it is closed.
  const [pendingEnforced, setPendingEnforced] = useState<boolean | null>(null);

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
      defaultRole: null,
      sessionMaxAgeSeconds: null,
      jitEnabled: null,
      issuer: null,
      clientId: null,
      clientSecretSet: null,
      redirectUri: null,
      // SAML: what describes the provider, and the three values to register on its side. Null on an
      // OIDC connection, as `issuer` and `redirectUri` are on a SAML one.
      idpEntityId: null,
      idpSsoUrl: null,
      idpSsoBinding: null,
      idpMetadataUrl: null,
      idpMetadataCheckedAt: null,
      idpMetadataChangedAt: null,
      allowIdpInitiated: null,
      attributeEmail: null,
      attributeGivenName: null,
      attributeFamilyName: null,
      spEntityId: null,
      spAcsUrl: null,
      spMetadataUrl: null,
      spCertificate: null,
      spCertificateNotAfter: null,
      lastTestedAt: null,
      lastTestedBy: { fields: { id: null, email: null } },
      enforcedAt: null,
    },
  });

  const {
    data: domains,
    isLoading: areDomainsLoading,
    error: domainsError,
  } = useGetSsoDomains({
    staticParams: { organizationId },
    offset: 0,
    limit: SSO_DOMAINS_LIMIT,
    fields: {
      id: null,
      domain: null,
      status: null,
      verificationRecordType: null,
      verificationRecordName: null,
      verificationRecordValue: null,
      verifiedAt: null,
      lastCheckedAt: null,
    },
  });

  const updateEnablement = useUpdateSsoConnectionEnablement({
    onSuccess: (updated) =>
      toast.success(
        updated.status === 'enabled'
          ? t('security.sso.enabledToast')
          : t('security.sso.disabledToast'),
      ),
    // 409 when the connection was never tested or no domain is verified, 409 too when disabling one
    // that is still enforced: the API says which, and a retry would not help.
    onError: (error) => toast.error(error.error),
  });

  // The connection is handed over so the hook knows what a finished test changed.
  const { startTest, isTesting } = useSsoTestSignIn(organizationId, connection);

  // A 404 is how the API says "no connection yet": the workspace is entitled, or this section would
  // not be rendered. Any other failure is said out loud, since empty cards would otherwise read as
  // "nothing configured yet".
  const hasNoConnection = connectionError?.httpCode === 404;
  const loadError =
    (hasNoConnection ? null : connectionError?.error) ??
    domainsError?.error ??
    null;
  const domainRows = domains?.data ?? [];
  const hasVerifiedDomain = domainRows.some(
    (domain) => domain.status === 'verified',
  );
  const status = connection?.status ?? null;
  const { membersOnVerifiedDomainsCount, membersCountIsPartial } = useMemo(
    () =>
      countMembersOnVerifiedDomains(
        members,
        verifiedDomainNames(domains?.data),
        membersTotalCount,
      ),
    [members, domains?.data, membersTotalCount],
  );

  return (
    <>
      {loadError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>
            {t('security.sso.loadError')} {loadError}
          </AlertDescription>
        </Alert>
      )}

      <SsoVerifiedDomainsCard
        organizationId={organizationId}
        domains={domainRows}
        isLoading={areDomainsLoading}
        isConnectionActive={status === 'enabled' || status === 'enforced'}
      />

      <SsoIdentityProviderCard
        organizationId={organizationId}
        connection={connection}
        isLoading={isConnectionLoading}
      />

      {/* Its Enable step reads the domains too: until they are known, "verify a domain first" would
          be a guess, and Enable disabled for no reason. */}
      <SsoStatusCard
        connection={connection}
        isLoading={isConnectionLoading || areDomainsLoading}
        hasVerifiedDomain={hasVerifiedDomain}
        isTesting={isTesting}
        isUpdatingEnablement={updateEnablement.isPending}
        onTest={startTest}
        onEnable={() =>
          updateEnablement.mutate({ organizationId, enabled: true })
        }
        onDisable={() =>
          updateEnablement.mutate({ organizationId, enabled: false })
        }
        onEnforcementChange={setPendingEnforced}
      />

      {/* The certificates are what a SAML response is verified with: no connection, none to hold. */}
      {connection?.id && connection.protocol === 'saml' && (
        <SsoCertificatesCard
          organizationId={organizationId}
          connection={connection}
        />
      )}

      {/* Nothing to provision until the connection exists; its settings live on it. */}
      {connection?.id && (
        <SsoProvisioningCard
          organizationId={organizationId}
          connection={connection}
        />
      )}

      {pendingEnforced !== null && (
        <SsoEnforcementModal
          open
          onOpenChange={(open) => !open && setPendingEnforced(null)}
          organizationId={organizationId}
          enforced={pendingEnforced}
          membersOnVerifiedDomainsCount={membersOnVerifiedDomainsCount}
          membersCountIsPartial={membersCountIsPartial}
        />
      )}
    </>
  );
}
