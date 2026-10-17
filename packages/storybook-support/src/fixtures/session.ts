import {
  mockUser,
  readAppConfigurationSchema,
  readOrganizationSchema,
  readQuotaSchema,
  readUserSchema,
  type ReadAppConfiguration,
  type ReadOrganization,
  type User,
} from '@skeleton/core-api-models';
import { daysAgo, daysFromNow, make, uuid } from './make';

export const WORKSPACE_ID = uuid(1, '0a000000');
export const OTHER_WORKSPACE_ID = uuid(2, '0a000000');
export const USER_ID = uuid(1, '0b000000');

export const connectedUser: User = make(readUserSchema, {
  ...mockUser,
  id: USER_ID,
  email: 'camille.martin@acme.io',
  firstName: 'Camille',
  lastName: 'Martin',
  profileImage: null,
  createdAt: daysAgo(180),
  updatedAt: daysAgo(3),
});

export const appConfiguration: ReadAppConfiguration = make(readAppConfigurationSchema, {
  featuresConfigurations: {
    aiAssistant: { enabled: true, version: 1 },
  },
});

/** The generic quotas of a plan (`organization.activeQuotas`): the feature carries its display name. */
export const quota = (featureKey: string, displayName: string, quotaLimit: number, currentUsage: number) =>
  make(readQuotaSchema, {
    id: uuid(featureKey.length, '0c000000'),
    featureKey,
    feature: { id: `feat_${featureKey}`, lookupKey: featureKey, displayName },
    status: 'active',
    quotaLimit,
    currentUsage,
    remainingQuota: Math.max(quotaLimit - currentUsage, 0),
    periodStart: daysAgo(10),
    periodEnd: daysFromNow(20),
  });

/** The workspace every story runs in: a business on a paid plan. */
export const workspace: ReadOrganization = make(readOrganizationSchema, {
  id: WORKSPACE_ID,
  name: 'Acme',
  domain: 'acme.io',
  type: 'business',
  status: 'active',
  mfaRequired: false,
  ssoAvailable: false,
  ssoStatus: 'none',
  createdAt: daysAgo(120),
  updatedAt: daysAgo(2),
  statistics: { activeMembersCount: 6 },
  activeQuotas: [quota('ai_messages', 'AI messages', 500, 120), quota('seats', 'Seats', 10, 6)],
  subscription: {
    id: 'sub_storybook',
    status: 'active',
    currentPeriodStart: daysAgo(10),
    currentPeriodEnd: daysFromNow(20),
    startDate: daysAgo(120),
    productGroup: { id: uuid(1, '0e000000'), name: 'Pro' },
    items: [{ price: { currency: 'eur', unitAmountInCents: 4900, recurringInterval: 'month', recurringIntervalCount: 1 } }],
  } as ReadOrganization['subscription'],
});

/** Workspace variants for `parameters.workspace`. */
export const workspaces = {
  default: workspace,
  /** Free plan, no subscription. */
  free: { ...workspace, subscription: null, activeQuotas: [quota('ai_messages', 'AI messages', 50, 12), quota('seats', 'Seats', 2, 1)] },
  /** Every quota used up. */
  overQuota: { ...workspace, activeQuotas: [quota('ai_messages', 'AI messages', 500, 500), quota('seats', 'Seats', 10, 10)] },
  /** Another workspace the connected user belongs to (the workspace switcher lists it). */
  other: { ...workspace, id: OTHER_WORKSPACE_ID, name: 'Globex', domain: 'globex.com', subscription: null },
} satisfies Record<string, ReadOrganization>;

export type WorkspaceVariant = keyof typeof workspaces;
