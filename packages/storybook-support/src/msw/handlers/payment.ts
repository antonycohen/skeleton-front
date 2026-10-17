import { http, HttpResponse, type HttpHandler } from 'msw';
import { api, collection, json, problem } from '../api';
import {
  allPaymentProducts,
  pastQuotas,
  paymentCustomers,
  paymentPrices,
  paymentQuotaTransactions,
  paymentSubscriptions,
  productGroups,
} from '../../fixtures/payment';
import { workspaces } from '../../fixtures/session';
import { scenario } from '../../scenario';

/** A query parameter, whichever case the client sent it in (it snake-cases them: `organization_id`). */
const param = (request: Request, name: string) => {
  const search = new URL(request.url).searchParams;
  return search.get(name) ?? search.get(name.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`));
};

const byTerm = <T extends { name?: string | null }>(items: T[], request: Request) => {
  const term = param(request, 'term')?.toLowerCase();
  return term ? items.filter((item) => item.name?.toLowerCase().includes(term)) : items;
};

const findGroup = (id: unknown) => productGroups.find((group) => group.id === id);

/** The workspace a request is scoped to (`?organizationId=`), the story's one by default. */
const organizationOf = (request: Request) => {
  const id = param(request, 'organizationId');
  return [scenario.workspace, ...Object.values(workspaces)].find((w) => w.id === id) ?? (id ? null : scenario.workspace);
};

/**
 * Stripe hands back a URL the app sends the browser to. Answering `null` keeps the story in place
 * (the app only redirects when there is one) instead of navigating the Storybook frame away.
 */
const noRedirect = { url: null };

const noContent = () =>
  new HttpResponse(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': window.location.origin, 'Access-Control-Allow-Credentials': 'true' },
  });

const body = async (request: Request) => ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;

/** Default handlers for the payment domain (fixtures in ../../fixtures/payment.ts). */
export const paymentHandlers: HttpHandler[] = [
  // Product groups: the anonymous read (paywall) only serves active groups; the back office's serves all.
  http.get(api('/public/product-groups/:id'), ({ params }) => {
    const group = findGroup(params['id']);
    return group?.active ? json(group) : problem(404, 'Product group not found');
  }),
  http.get(api('/product-groups'), ({ request }) => collection(byTerm(productGroups, request), request)),
  http.post(api('/product-groups'), async ({ request }) =>
    json({ ...productGroups[0], products: [], id: 'pg_storybook_new', ...(await body(request)) }, { status: 201 }),
  ),
  http.get(api('/product-groups/:id'), ({ params }) => {
    const group = findGroup(params['id']);
    return group ? json(group) : problem(404, 'Product group not found');
  }),
  http.put(api('/product-groups/:id'), async ({ params, request }) =>
    json({ ...findGroup(params['id']), ...(await body(request)) }),
  ),
  http.post(api('/product-groups/:id/reposition-products'), () => noContent()),

  // Products and prices
  http.get(api('/products'), ({ request }) => collection(byTerm(allPaymentProducts, request), request)),
  http.post(api('/products'), async ({ request }) => json({ ...(await body(request)), active: true, prices: [] }, { status: 201 })),
  http.get(api('/products/:id'), ({ params }) => {
    const product = allPaymentProducts.find((p) => p.id === params['id']);
    return product ? json(product) : problem(404, 'Product not found');
  }),
  http.put(api('/products/:id'), async ({ params, request }) =>
    json({ ...allPaymentProducts.find((p) => p.id === params['id']), ...(await body(request)) }),
  ),
  http.get(api('/prices'), ({ request }) => {
    const productId = param(request, 'productId');
    return collection(productId ? paymentPrices.filter((p) => p.product?.id === productId) : paymentPrices, request);
  }),
  http.post(api('/prices'), async ({ request }) =>
    json({ id: `price_storybook_${Date.now()}`, active: true, ...(await body(request)) }, { status: 201 }),
  ),
  http.get(api('/prices/:id'), ({ params }) => {
    const price = paymentPrices.find((p) => p.id === params['id']);
    return price ? json(price) : problem(404, 'Price not found');
  }),
  http.put(api('/prices/:id'), async ({ params, request }) =>
    json({ ...paymentPrices.find((p) => p.id === params['id']), ...(await body(request)) }),
  ),

  // Customers (no organization filter on the API: the app matches the nested organization itself)
  http.get(api('/customers'), ({ request }) => collection(paymentCustomers, request)),
  http.get(api('/customers/:id'), ({ params }) => {
    const customer = paymentCustomers.find((c) => c.id === params['id']);
    return customer ? json(customer) : problem(404, 'Customer not found');
  }),

  // Subscriptions: checkout (paywall), the back office's list and invoiced creation
  http.post(api('/subscriptions/checkout-session'), () => json({ checkoutUrl: null })),
  http.get(api('/subscriptions'), ({ request }) => {
    const organizationId = param(request, 'organizationId');
    return collection(
      organizationId ? paymentSubscriptions.filter((s) => s.organizationId === organizationId) : paymentSubscriptions,
      request,
    );
  }),
  http.post(api('/subscriptions'), async ({ request }) =>
    json({ ...paymentSubscriptions[0], id: 'sub_storybook_invoiced', status: 'active', collectionMethod: 'send_invoice', ...(await body(request)) }, { status: 201 }),
  ),
  http.get(api('/subscriptions/:id'), ({ params }) => {
    const subscription = paymentSubscriptions.find((s) => s.id === params['id']);
    return subscription ? json(subscription) : problem(404, 'Subscription not found');
  }),

  // Quotas: the workspace's active ones (`organization.activeQuotas`) and the past periods'
  http.get(api('/quotas'), ({ request }) => {
    const organization = organizationOf(request);
    return collection(organization ? [...(organization.activeQuotas ?? []), ...pastQuotas] : [], request);
  }),
  http.get(api('/quotas/:id'), ({ params }) => {
    const found = [...(scenario.workspace.activeQuotas ?? []), ...pastQuotas].find((q) => q.id === params['id']);
    return found ? json(found) : problem(404, 'Quota not found');
  }),
  http.post(api('/admin/organizations/:organizationId/quota-credits'), async ({ params, request }) => {
    // The body arrives in wire format (snake_case).
    const adjustment = (await body(request)) as { feature_key?: string; amount?: number; period_end?: string };
    const { feature_key: featureKey, amount, period_end: periodEnd } = adjustment;
    const organization = [scenario.workspace, ...Object.values(workspaces)].find((w) => w.id === params['organizationId']) ?? scenario.workspace;
    const current = organization.activeQuotas?.find((q) => q.featureKey === featureKey);
    if (!current) return problem(404, 'Quota not found');
    const quotaLimit = (current.quotaLimit ?? 0) + (amount ?? 0);
    return json({ ...current, quotaLimit, remainingQuota: Math.max(quotaLimit - (current.currentUsage ?? 0), 0), periodEnd: periodEnd ?? current.periodEnd });
  }),
  http.get(api('/quota-transactions'), ({ request }) => collection(paymentQuotaTransactions, request)),

  // Stripe customer portal (manage, update payment method, cancel, upgrade)
  http.post(api('/customer-portal/sessions'), () => json(noRedirect)),
  http.post(api('/customer-portal/sessions/:flow'), () => json(noRedirect)),
];
