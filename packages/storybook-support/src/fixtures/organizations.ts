import {
  readOrganizationMemberSchema,
  readOrganizationSchema,
  readQuotaSchema,
  readQuotaTransactionSchema,
  readServiceAccountSchema,
  readSsoCertificateSchema,
  readSsoConnectionSchema,
  readSsoDomainSchema,
  readSubscriptionSchema,
  type MemberRole,
  type MemberStatus,
  type QuotaOperationType,
  type QuotaStatus,
  type ReadOrganization,
  type ReadSubscription,
  type ServiceAccountPermissionCatalogEntry,
} from '@skeleton/core-api-models';
import { daysAgo, daysFromNow, make, uuid } from './make';
import { connectedUser, USER_ID, workspace, WORKSPACE_ID, workspaces } from './session';

const id = (n: number) => uuid(n, '4a000000');

// === Members (settings › team, back office › members) ===

const member = (
  n: number,
  firstName: string | null,
  lastName: string | null,
  email: string,
  role: MemberRole,
  status: MemberStatus,
  mfaEnabled: boolean | null,
  userId: string | null = id(100 + n),
) =>
  make(readOrganizationMemberSchema, {
    id: id(n),
    user: status === 'invited' || !userId ? null : { id: userId, firstName, lastName, email, profileImage: null },
    organization: { id: WORKSPACE_ID, name: 'Acme' },
    status,
    role,
    email,
    firstName,
    lastName,
    // Only filled for the workspace's admins (the connected user is one); null on invitations.
    mfaEnabled: status === 'invited' ? null : mfaEnabled,
    ssoLinked: status === 'invited' ? null : false,
    createdAt: daysAgo(120 - n * 9),
    updatedAt: daysAgo(n),
  });

/** Acme's team: the connected user (admin), active editors/viewers, pending invitations, a suspended member. */
export const organizationMembers = [
  member(1, 'Camille', 'Martin', 'camille.martin@acme.io', 'admin', 'accepted', true, USER_ID),
  member(2, 'Hugo', 'Bernard', 'hugo.bernard@acme.io', 'admin', 'accepted', true),
  member(3, 'Léa', 'Dubois', 'lea.dubois@acme.io', 'editor', 'accepted', false),
  member(4, 'Thomas', 'Petit', 'thomas.petit@acme.io', 'editor', 'accepted', true),
  member(5, 'Priya', 'Shah', 'priya.shah@acme.io', 'viewer', 'accepted', false),
  member(6, 'Marc', 'Lefèvre', 'marc.lefevre@acme.io', 'viewer', 'suspended', false),
  member(7, null, null, 'sarah.nguyen@acme.io', 'editor', 'invited', null),
  member(8, null, null, 'j.ortiz@acme-partners.com', 'viewer', 'invited', null),
];

/** The same team, seen by a member who is not an admin: the security attributes come back null. */
export const organizationMembersAsEditor = organizationMembers.map((m) =>
  m.user?.id === USER_ID
    ? { ...m, role: 'editor' as const, mfaEnabled: null, ssoLinked: null }
    : { ...m, mfaEnabled: null, ssoLinked: null },
);

// === Service accounts ===

const longPermission = (short: string) => `organization:${WORKSPACE_ID}:${short}`;

/** What `GET /service-accounts/permission-catalog` offers (short form, joined with each action). */
export const serviceAccountPermissionCatalog: ServiceAccountPermissionCatalogEntry[] = [
  { resource: 'member:*', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'conversation:*', actions: ['read', 'create', 'delete'] },
  { resource: 'conversation:*:message:*', actions: ['read', 'create'] },
  { resource: 'subscription:*', actions: ['read'] },
  { resource: 'job:*', actions: ['read'] },
];

export const serviceAccounts = [
  make(readServiceAccountSchema, {
    id: id(201),
    name: 'Directory sync (SCIM bridge)',
    clientId: 'sa_7Hk2pQ9xWm4R',
    permissions: ['member:*:read', 'member:*:create', 'member:*:update', 'member:*:delete'].map(longPermission),
    status: 'active',
    organization: { id: WORKSPACE_ID, name: 'Acme' },
    createdBy: USER_ID,
    createdAt: daysAgo(64),
    updatedAt: daysAgo(12),
  }),
  make(readServiceAccountSchema, {
    id: id(202),
    name: 'Data warehouse export',
    clientId: 'sa_N3vB8cLe2Tz6',
    permissions: ['conversation:*:read', 'subscription:*:read', 'job:*:read'].map(longPermission),
    status: 'active',
    organization: { id: WORKSPACE_ID, name: 'Acme' },
    createdBy: USER_ID,
    createdAt: daysAgo(31),
    updatedAt: daysAgo(31),
  }),
  make(readServiceAccountSchema, {
    id: id(203),
    name: 'Legacy Zapier bridge',
    clientId: 'sa_Qa1Yd5Fg0Uo3',
    permissions: ['conversation:*:read', 'conversation:*:message:*:read'].map(longPermission),
    status: 'disabled',
    organization: { id: WORKSPACE_ID, name: 'Acme' },
    createdBy: id(102),
    createdAt: daysAgo(210),
    updatedAt: daysAgo(40),
  }),
];

// === Single sign-on ===

const userRef = { id: USER_ID, email: connectedUser.email as string, firstName: 'Camille', lastName: 'Martin' };

export const ssoDomains = [
  make(readSsoDomainSchema, {
    id: id(301),
    domain: 'acme.io',
    status: 'verified',
    verificationRecordType: 'TXT',
    verificationRecordName: '_skeleton-verification.acme.io',
    verificationRecordValue: 'skeleton-site-verification=8f2c1e9a7b4d',
    verifiedAt: daysAgo(30),
    lastCheckedAt: daysAgo(0),
    consecutiveFailures: 0,
    createdAt: daysAgo(31),
    updatedAt: daysAgo(0),
  }),
  make(readSsoDomainSchema, {
    id: id(302),
    domain: 'acme-partners.com',
    status: 'pending',
    verificationRecordType: 'TXT',
    verificationRecordName: '_skeleton-verification.acme-partners.com',
    verificationRecordValue: 'skeleton-site-verification=c41d0b62e93f',
    verifiedAt: null,
    lastCheckedAt: daysAgo(1),
    consecutiveFailures: 0,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  }),
];

const ssoCommon = {
  id: id(310),
  defaultRole: 'viewer' as const,
  sessionMaxAgeSeconds: 86_400,
  jitEnabled: true,
  lastTestedAt: daysAgo(14),
  lastTestedBy: userRef,
  createdAt: daysAgo(30),
  updatedAt: daysAgo(14),
};

/** Okta over OpenID Connect, tested and enabled (not enforced). */
export const ssoOidcConnection = make(readSsoConnectionSchema, {
  ...ssoCommon,
  protocol: 'oidc',
  status: 'enabled',
  issuer: 'https://acme.okta.com/oauth2/default',
  clientId: '0oa9x2kq7mJdT4hZr5d7',
  clientSecretSet: true,
  redirectUri: 'https://auth.example.com/sso/oidc/callback',
});

/** Just saved, never tested: the next step is the test sign-in. */
export const ssoDraftConnection = make(readSsoConnectionSchema, {
  ...ssoCommon,
  protocol: 'oidc',
  status: 'draft',
  issuer: 'https://acme.okta.com/oauth2/default',
  clientId: '0oa9x2kq7mJdT4hZr5d7',
  clientSecretSet: true,
  redirectUri: 'https://auth.example.com/sso/oidc/callback',
  lastTestedAt: null,
  lastTestedBy: null,
});

const PEM =
  '-----BEGIN CERTIFICATE-----\nMIIDpDCCAoygAwIBAgIGAYxk3Q2bMA0GCSqGSIb3DQEBCwUAMIGSMQswCQYDVQQGEwJVUzETMBEG\nA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsGA1UECgwET2t0YTEU\n-----END CERTIFICATE-----';

export const ssoCertificates = [
  make(readSsoCertificateSchema, {
    id: id(321),
    pem: PEM,
    fingerprintSha256: '4F:2A:9C:11:7E:B0:3D:58:E6:21:C4:9F:0A:77:1B:D2:63:8E:5A:F4:02:C9:BB:16:3E:70:D8:45:A1:9B:6C:E3',
    subject: 'CN=dev-acme, OU=SSOProvider, O=Okta, L=San Francisco, ST=California, C=US',
    notBefore: daysAgo(340),
    notAfter: daysFromNow(25),
    status: 'valid',
    createdAt: daysAgo(30),
    createdBy: userRef,
  }),
  make(readSsoCertificateSchema, {
    id: id(322),
    pem: PEM,
    fingerprintSha256: 'A7:03:5D:E2:91:4C:6B:F8:20:3A:D7:5E:C1:88:0F:B4:39:62:7D:E5:A0:1C:93:4F:BE:27:D6:05:8A:71:CC:3E',
    subject: 'CN=dev-acme-2027, OU=SSOProvider, O=Okta, L=San Francisco, ST=California, C=US',
    notBefore: daysAgo(3),
    notAfter: daysFromNow(1092),
    status: 'valid',
    createdAt: daysAgo(3),
    createdBy: userRef,
  }),
];

/** Okta over SAML, required for everyone on the verified domains. */
export const ssoSamlConnection = make(readSsoConnectionSchema, {
  ...ssoCommon,
  protocol: 'saml',
  status: 'enforced',
  idpEntityId: 'http://www.okta.com/exk9x2kq7mJdT4hZr5d7',
  idpSsoUrl: 'https://acme.okta.com/app/acme_skeleton_1/exk9x2kq7mJdT4hZr5d7/sso/saml',
  idpSsoBinding: 'redirect',
  idpMetadataUrl: 'https://acme.okta.com/app/exk9x2kq7mJdT4hZr5d7/sso/saml/metadata',
  idpMetadataCheckedAt: daysAgo(0),
  allowIdpInitiated: false,
  // Left empty: the names of the common providers are tried.
  attributeEmail: null,
  attributeGivenName: null,
  attributeFamilyName: null,
  spEntityId: 'https://auth.example.com/sso/saml/acme',
  spAcsUrl: 'https://auth.example.com/sso/saml/acme/acs',
  spMetadataUrl: 'https://auth.example.com/sso/saml/acme/metadata',
  spCertificate: PEM,
  spCertificateNotAfter: daysFromNow(400),
  certificates: ssoCertificates,
  nearestCertificateExpiry: daysFromNow(25),
  enforcedAt: daysAgo(7),
  enforcedBy: userRef,
});

/** The open workspace, entitled to single sign-on, its connection enabled. */
export const workspaceWithSso: ReadOrganization = { ...workspace, ssoAvailable: true, ssoStatus: 'enabled' };

// === Workspaces ===

const organization = (n: number, overrides: Partial<ReadOrganization>) =>
  make(readOrganizationSchema, {
    id: id(n),
    type: 'business',
    status: 'active',
    mfaRequired: false,
    ssoAvailable: false,
    ssoStatus: 'none',
    createdAt: daysAgo(200 - n),
    updatedAt: daysAgo(n % 9),
    ...overrides,
  });

const stats = (activeMembersCount: number) => ({ activeMembersCount });

/** Every workspace the connected user belongs to (the "Workspaces" list). */
export const userOrganizations: ReadOrganization[] = [
  { ...workspace, statistics: stats(6) },
  { ...workspaces.other, statistics: stats(3) },
  organization(11, { name: 'Initech', domain: 'initech.com', statistics: stats(2) }),
  organization(12, { name: 'Camille Martin', domain: null, type: 'individual', statistics: stats(1) }),
  organization(13, { name: 'Acme Labs (sandbox)', domain: 'labs.acme.io', statistics: stats(1), deleteAt: daysFromNow(12) }),
];

// === Back office ===

export const BACK_OFFICE_ORGANIZATION_ID = id(21);

const backOfficeSubscriptionItems = [
  {
    id: 'si_globex',
    quantity: 25,
    price: { id: 'price_pro_yearly', nickname: 'Yearly, 25 seats', product: { id: 'prod_pro', name: 'Pro' } },
  },
] as unknown as ReadSubscription['items'];

/** The customer workspace opened in the back office: Globex, with two-factor and SSO required. */
export const backOfficeOrganization = organization(21, {
  name: 'Globex Corporation',
  domain: 'globex.com',
  mfaRequired: true,
  ssoAvailable: true,
  ssoStatus: 'enforced',
  statistics: stats(14),
  activeQuotas: workspace.activeQuotas,
  subscription: { ...workspace.subscription, id: 'sub_globex', organizationId: id(21) } as ReadOrganization['subscription'],
});

/** Every customer workspace (back office list): SSO statuses, an individual, a deleted one. */
export const backOfficeOrganizations: ReadOrganization[] = [
  backOfficeOrganization,
  { ...workspace, ssoAvailable: true, ssoStatus: 'enabled' },
  organization(22, { name: 'Initech', domain: 'initech.com' }),
  organization(23, { name: 'Hooli', domain: 'hooli.xyz', ssoAvailable: true, ssoStatus: 'draft' }),
  organization(24, { name: 'Umbrella Health', domain: 'umbrella-health.com', mfaRequired: true }),
  organization(25, { name: 'Stark Industries', domain: 'stark.com' }),
  organization(26, { name: 'Jane Doe', domain: null, type: 'individual' }),
  organization(27, { name: 'Soylent', domain: 'soylent.co', status: 'deleted', deleteAt: daysAgo(3) }),
];

/** Members of the back-office workspace (Globex): Acme's team on globex.com, led by Sofia Rossi. */
export const backOfficeOrganizationMembers = organizationMembers.map((m, i) => {
  const globexMember = {
    ...m,
    organization: { id: BACK_OFFICE_ORGANIZATION_ID, name: 'Globex Corporation' },
    email: (m.email as string).replace('acme.io', 'globex.com'),
    ssoLinked: m.status === 'accepted' ? i % 2 === 0 : null,
  };
  // The connected user is the staff member browsing the back office, not one of Globex's people.
  if (m.user?.id !== USER_ID) return globexMember;
  const person = { firstName: 'Sofia', lastName: 'Rossi', email: 'sofia.rossi@globex.com' };
  return { ...globexMember, ...person, user: { id: id(101), profileImage: null, ...person } };
});

const toGlobex = (value: string) => value.replace('acme.io', 'globex.com').replace('acme-partners', 'globex-partners');

/** The back-office workspace's SSO domains: what the enforced connection takes over. */
export const backOfficeSsoDomains = ssoDomains.map((d) => ({
  ...d,
  domain: toGlobex(d.domain as string),
  verificationRecordName: toGlobex(d.verificationRecordName as string),
}));

const globexAdmin = { id: id(102), email: 'hugo.bernard@globex.com', firstName: 'Hugo', lastName: 'Bernard' };

/** Globex's connection: SAML, tested and required by one of its admins. */
export const backOfficeSsoConnection = {
  ...ssoSamlConnection,
  idpEntityId: 'http://www.okta.com/exk4g1obex7mJdT4hZr',
  idpSsoUrl: 'https://globex.okta.com/app/globex_skeleton_1/exk4g1obex7mJdT4hZr/sso/saml',
  idpMetadataUrl: 'https://globex.okta.com/app/exk4g1obex7mJdT4hZr/sso/saml/metadata',
  spEntityId: 'https://auth.example.com/sso/saml/globex',
  spAcsUrl: 'https://auth.example.com/sso/saml/globex/acs',
  spMetadataUrl: 'https://auth.example.com/sso/saml/globex/metadata',
  lastTestedBy: globexAdmin,
  enforcedBy: globexAdmin,
};

const feature = (featureKey: string, displayName: string) => ({ id: `feat_${featureKey}`, lookupKey: featureKey, displayName });

const quotaRow = (
  n: number,
  featureKey: string,
  displayName: string,
  status: QuotaStatus,
  quotaLimit: number,
  currentUsage: number,
  period: [number, number],
) =>
  make(readQuotaSchema, {
    id: id(n),
    featureKey,
    feature: feature(featureKey, displayName),
    aggregationType: featureKey === 'seats' ? 'last' : 'count',
    status,
    quotaLimit,
    currentUsage,
    remainingQuota: Math.max(quotaLimit - currentUsage, 0),
    periodStart: daysAgo(period[0]),
    periodEnd: daysFromNow(period[1]),
    createdAt: daysAgo(period[0]),
    updatedAt: daysAgo(status === 'active' ? 0 : -period[1]),
  });

export const BACK_OFFICE_AI_QUOTA_ID = id(401);

/** `GET /quotas?organization_id=…` for Globex: the current period's quotas, then past ones. */
export const backOfficeOrganizationQuotas = [
  quotaRow(401, 'ai_messages', 'AI messages', 'active', 2000, 1340, [10, 20]),
  quotaRow(402, 'seats', 'Seats', 'active', 25, 14, [10, 20]),
  quotaRow(403, 'ai_messages', 'AI messages', 'expired', 2000, 2000, [40, -10]),
  quotaRow(404, 'seats', 'Seats', 'superseded', 20, 14, [40, -10]),
];

const transaction = (
  n: number,
  operationType: QuotaOperationType,
  amount: number,
  description: string,
  createdDaysAgo: number,
  referenceType: string | null = null,
) =>
  make(readQuotaTransactionSchema, {
    id: id(n),
    amount,
    operationType,
    description,
    referenceType,
    referenceId: referenceType ? id(n + 100) : null,
    createdAt: daysAgo(createdDaysAgo),
  });

/** `GET /quota-transactions?organization_id=…` for Globex: allocations, consumption, an adjustment. */
export const backOfficeOrganizationQuotaTransactions = [
  transaction(501, 'ALLOCATE', 2000, 'Pro plan, period start', 10, 'subscription'),
  transaction(502, 'CONSUME', 420, 'AI assistant messages', 8, 'conversation'),
  transaction(503, 'CONSUME', 610, 'AI assistant messages', 5, 'conversation'),
  transaction(504, 'ADJUST', 250, 'Goodwill credit after the incident of the 2nd', 4),
  transaction(505, 'REFUND', -30, 'Failed generations refunded', 3, 'conversation'),
  transaction(506, 'CONSUME', 340, 'AI assistant messages', 1, 'conversation'),
  transaction(507, 'RESET', 0, 'Period rollover', 10),
];

const subscription = (n: number, overrides: Partial<ReadSubscription>) =>
  make(readSubscriptionSchema, {
    id: `sub_globex_${n}`,
    organizationId: BACK_OFFICE_ORGANIZATION_ID,
    organization: { id: BACK_OFFICE_ORGANIZATION_ID, name: 'Globex Corporation' },
    productGroup: { id: uuid(1, '0e000000'), name: 'Pro' } as ReadSubscription['productGroup'],
    items: backOfficeSubscriptionItems,
    cancelAtPeriodEnd: false,
    ...overrides,
  });

/** `GET /subscriptions?organization_id=…` for Globex: the current one, invoiced, and a past trial. */
export const backOfficeOrganizationSubscriptions = [
  subscription(1, {
    status: 'active',
    description: 'Yearly contract, invoiced',
    collectionMethod: 'send_invoice',
    currentPeriodStart: daysAgo(10),
    currentPeriodEnd: daysFromNow(355),
    createdAt: daysAgo(10),
  }),
  subscription(2, {
    status: 'canceled',
    description: null,
    trialEnd: daysAgo(40),
    currentPeriodEnd: daysAgo(40),
    canceledAt: daysAgo(40),
    createdAt: daysAgo(54),
  }),
];
