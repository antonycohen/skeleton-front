import {
  readCustomerSchema,
  readPriceSchema,
  readProductGroupSchema,
  readProductSchema,
  readQuotaTransactionSchema,
  readSubscriptionSchema,
  type ReadCustomer,
  type ReadOrganization,
  type ReadPrice,
  type ReadProduct,
  type ReadProductGroup,
  type ReadQuota,
  type ReadQuotaTransaction,
  type ReadSubscription,
} from '@skeleton/core-api-models';
import { aiId } from './ai';
import { daysAgo, daysFromNow, make, uuid } from './make';
import { OTHER_WORKSPACE_ID, WORKSPACE_ID, quota, workspace } from './session';

/** Payment fixtures: Stripe-mirrored product groups, products, prices, customers, subscriptions. */
const PAYMENT = '5a000000';
export const paymentId = (n: number) => uuid(n, PAYMENT);

/**
 * The product group the paywall sells (`VITE_PAYWALL_PRODUCT_GROUP_ID` in `.env.storybook`, read
 * through `GET /public/product-groups/pg_pro`): every product in it is offered.
 */
export const PRO_PRODUCT_GROUP_ID = 'pg_pro';

/** What a plan grants, as `product.quotas` (feature key → amount per period), like session.ts's quotas. */
type PlanQuotas = { aiMessages: number; seats: number };

const makePrice = (
  id: string,
  product: { id: string; name: string },
  interval: 'month' | 'year',
  unitAmountInCents: number,
  overrides: Partial<ReadPrice> = {},
): ReadPrice =>
  make(readPriceSchema, {
    id,
    nickname: `${product.name} — ${interval === 'month' ? 'monthly' : 'yearly'}`,
    product,
    currency: 'eur',
    lookupKey: `${product.id.replace('prod_', '')}_${interval}ly`,
    recurringInterval: interval,
    recurringIntervalCount: 1,
    recurringUsageType: 'licensed',
    active: true,
    unitAmountInCents,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(30),
    ...overrides,
  });

const makeProduct = (
  id: string,
  name: string,
  quotas: PlanQuotas,
  monthlyInCents: number,
  productGroup: { id: string; name: string },
  overrides: Partial<ReadProduct> = {},
): ReadProduct =>
  make(readProductSchema, {
    id,
    name,
    description: `${quotas.aiMessages.toLocaleString('en-US')} AI messages a month, up to ${quotas.seats} seats`,
    active: true,
    type: 'service',
    unitLabel: 'workspace',
    metadata: {},
    quotas,
    prices: [
      makePrice(`price_${id}_month`, { id, name }, 'month', monthlyInCents),
      // Two months free on the yearly price.
      makePrice(`price_${id}_year`, { id, name }, 'year', monthlyInCents * 10),
    ],
    productGroup,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(30),
    ...overrides,
  });

const SELF_SERVE = { id: PRO_PRODUCT_GROUP_ID, name: 'Self-serve plans' };
const ENTERPRISE = { id: 'pg_enterprise', name: 'Enterprise' };

/** The paywall's products: Pro (the plan the default workspace is on, €49 a month) and Business. */
export const paymentProducts: ReadProduct[] = [
  makeProduct('prod_pro', 'Pro', { aiMessages: 500, seats: 10 }, 4900, SELF_SERVE),
  makeProduct('prod_business', 'Business', { aiMessages: 2000, seats: 50 }, 14900, SELF_SERVE, {
    // A retired price stays listed, inactive.
    prices: [
      makePrice('price_prod_business_month', { id: 'prod_business', name: 'Business' }, 'month', 14900),
      makePrice('price_prod_business_year', { id: 'prod_business', name: 'Business' }, 'year', 149000),
      makePrice('price_prod_business_month_2025', { id: 'prod_business', name: 'Business' }, 'month', 12900, {
        active: false,
        nickname: 'Business — 2025 monthly',
        lookupKey: 'business_monthly_2025',
      }),
    ],
  }),
];

const enterpriseProducts: ReadProduct[] = [
  makeProduct('prod_enterprise', 'Enterprise', { aiMessages: 10000, seats: 250 }, 99000, ENTERPRISE, {
    description: 'Custom quotas, single sign-on and invoiced billing',
    // Invoiced yearly by the sales team: no monthly price.
    prices: [makePrice('price_prod_enterprise_year', { id: 'prod_enterprise', name: 'Enterprise' }, 'year', 990000)],
  }),
];

/** Every price of the catalogue, inactive ones included. */
export const paymentPrices: ReadPrice[] = [...paymentProducts, ...enterpriseProducts].flatMap(
  (product) => product.prices ?? [],
);

const makeProductGroup = (id: string, overrides: Partial<ReadProductGroup>): ReadProductGroup =>
  make(readProductGroupSchema, {
    id,
    active: true,
    portalConfigurationId: 'bpc_1Q2w3E4r5T6y',
    metadata: {},
    createdAt: daysAgo(200),
    updatedAt: daysAgo(30),
    products: [],
    ...overrides,
  });

export const productGroups: ReadProductGroup[] = [
  makeProductGroup(PRO_PRODUCT_GROUP_ID, {
    name: SELF_SERVE.name,
    description: 'Pro and Business, bought from the paywall and managed in the customer portal.',
    products: paymentProducts,
  }),
  makeProductGroup(ENTERPRISE.id, {
    name: ENTERPRISE.name,
    description: 'Custom plans invoiced by the sales team.',
    portalConfigurationId: null,
    products: enterpriseProducts,
  }),
  makeProductGroup('pg_legacy_2025', {
    name: 'Legacy 2025',
    description: 'Plans sold until December 2025, kept for existing subscriptions.',
    active: false,
    createdAt: daysAgo(400),
    updatedAt: daysAgo(280),
  }),
];

/** Every product of the catalogue. */
export const allPaymentProducts: ReadProduct[] = [...paymentProducts, ...enterpriseProducts];

export const paymentCustomers: ReadCustomer[] = [
  make(readCustomerSchema, {
    id: 'cus_Acme1234',
    name: 'Acme',
    email: 'billing@acme.io',
    currency: 'eur',
    delinquent: false,
    organization: { id: WORKSPACE_ID, name: 'Acme' },
    createdAt: daysAgo(120),
    updatedAt: daysAgo(10),
  }),
  make(readCustomerSchema, {
    id: 'cus_Globex5678',
    name: 'Globex',
    email: 'finance@globex.com',
    currency: 'eur',
    delinquent: true,
    organization: { id: OTHER_WORKSPACE_ID, name: 'Globex' },
    createdAt: daysAgo(90),
    updatedAt: daysAgo(3),
  }),
];

const [proMonthly, proYearly] = paymentProducts[0].prices ?? [];

export const paymentSubscriptions: ReadSubscription[] = [
  make(readSubscriptionSchema, {
    id: 'sub_storybook',
    status: 'active',
    currentPeriodStart: daysAgo(10),
    currentPeriodEnd: daysFromNow(20),
    cancelAtPeriodEnd: false,
    startDate: daysAgo(120),
    collectionMethod: 'charge_automatically',
    currency: 'eur',
    items: [{ id: 'si_storybook', price: proMonthly, quantity: 1, metadata: {}, createdAt: daysAgo(120), updatedAt: daysAgo(10) }],
    productGroup: productGroups[0],
    organizationId: WORKSPACE_ID,
    organization: { id: WORKSPACE_ID, name: 'Acme' },
    createdAt: daysAgo(120),
    updatedAt: daysAgo(10),
  }),
  // The plan Acme had before upgrading, ended.
  make(readSubscriptionSchema, {
    id: 'sub_storybook_2025',
    status: 'canceled',
    currentPeriodStart: daysAgo(150),
    currentPeriodEnd: daysAgo(120),
    cancelAtPeriodEnd: true,
    canceledAt: daysAgo(125),
    endedAt: daysAgo(120),
    startDate: daysAgo(330),
    collectionMethod: 'charge_automatically',
    currency: 'eur',
    description: 'Legacy 2025 — Team',
    items: [],
    productGroup: productGroups[2],
    organizationId: WORKSPACE_ID,
    organization: { id: WORKSPACE_ID, name: 'Acme' },
    createdAt: daysAgo(330),
    updatedAt: daysAgo(120),
  }),
];

/** The quotas of a workspace's past periods, superseded by the active ones (`organization.activeQuotas`). */
export const pastQuotas: ReadQuota[] = [
  { ...quota('ai_messages', 'AI messages', 500, 487), id: paymentId(51), status: 'expired', periodStart: daysAgo(40), periodEnd: daysAgo(10) },
  { ...quota('seats', 'Seats', 10, 6), id: paymentId(52), status: 'expired', periodStart: daysAgo(40), periodEnd: daysAgo(10) },
];

const transaction = (n: number, days: number, overrides: Partial<ReadQuotaTransaction>): ReadQuotaTransaction =>
  make(readQuotaTransactionSchema, { id: paymentId(100 + n), metadata: {}, createdAt: daysAgo(days), referenceType: null, referenceId: null, ...overrides });

const conversation = (n: number) => ({ referenceType: 'ai_conversation', referenceId: aiId(n) });

/** The AI messages quota's history, newest first: what the assistant consumed, refunds, allocations. */
export const paymentQuotaTransactions: ReadQuotaTransaction[] = [
  transaction(1, 0, { amount: 4, operationType: 'CONSUME', description: 'AI assistant — Quarterly churn review', ...conversation(1) }),
  transaction(2, 1, { amount: 1, operationType: 'REFUND', description: 'AI assistant — reply interrupted', ...conversation(2) }),
  transaction(3, 2, { amount: 6, operationType: 'CONSUME', description: 'AI assistant — Onboarding email sequence', ...conversation(2) }),
  transaction(4, 5, { amount: 50, operationType: 'ADJUST', description: 'Goodwill credit granted by support' }),
  transaction(5, 10, { amount: 500, operationType: 'ALLOCATE', description: 'Monthly allocation — Pro' }),
  transaction(6, 10, { amount: 13, operationType: 'RESET', description: 'Unused messages of the previous period expired' }),
];

/** Workspace variants for the billing screens (pass them as `parameters.workspace`). */
type OrganizationSubscription = NonNullable<ReadOrganization['subscription']>;

const withSubscription = (subscription: Partial<OrganizationSubscription>): ReadOrganization => ({
  ...workspace,
  subscription: { ...workspace.subscription, ...subscription } as OrganizationSubscription,
});

export const billingWorkspaces = {
  /** Cancellation scheduled at the end of the period. */
  cancelScheduled: withSubscription({ cancelAt: daysFromNow(20), cancelAtPeriodEnd: true }),
  /** The latest invoice is open and overdue: the shell shows the past-due banner. */
  pastDue: withSubscription({
    status: 'past_due',
    latestInvoice: {
      id: 'in_1Q2w3E4r',
      status: 'open',
      amountDue: 4900,
      amountPaid: 0,
      amountRemaining: 4900,
      currency: 'eur',
      hostedInvoiceUrl: 'https://invoice.stripe.com/i/acct_storybook/test_in_1Q2w3E4r',
      invoicePdf: null,
      dueDate: daysAgo(6),
      paidAt: null,
      number: 'ACME-0007',
      collectionMethod: 'charge_automatically',
      subscriptionId: 'sub_storybook',
      createdAt: daysAgo(13),
      updatedAt: daysAgo(6),
    },
  }),
  /** Pro, paid yearly. */
  yearly: withSubscription({
    items: [{ price: proYearly }] as OrganizationSubscription['items'],
  }),
} satisfies Record<string, ReadOrganization>;
