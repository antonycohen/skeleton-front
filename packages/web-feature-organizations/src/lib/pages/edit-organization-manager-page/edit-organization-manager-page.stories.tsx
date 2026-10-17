import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import {
  api,
  BACK_OFFICE_AI_QUOTA_ID,
  BACK_OFFICE_ORGANIZATION_ID,
  backOfficeOrganization,
  backOfficeOrganizationQuotas,
  backOfficeOrganizationQuotaTransactions,
  backOfficeOrganizationSubscriptions,
  collection,
  mock,
  type ScreenParameters,
} from '@skeleton/storybook-support';
import { AdminOrganizationsRoutes } from '../../routes/admin-organizations-routes';

const tab = (name: string): ScreenParameters => ({
  path: '/workspaces/*',
  url: `/workspaces/${BACK_OFFICE_ORGANIZATION_ID}/${name}`,
  layout: 'bare',
  workspace: false,
});

/**
 * The billing side of the workspace (subscriptions, quotas and their transactions) is read from
 * collections filtered by `organization_id`, outside the organizations domain: mocked here.
 */
const billingHandlers = [
  mock.collection('/subscriptions', backOfficeOrganizationSubscriptions),
  mock.collection('/quotas', backOfficeOrganizationQuotas),
  http.get(api('/quota-transactions'), ({ request }) => {
    const search = new URL(request.url).searchParams;
    const quotaId = search.get('quota_id') ?? search.get('quotaId');
    // Scoped to the AI messages quota: its allocation, consumption, adjustment and refund.
    const items = quotaId
      ? backOfficeOrganizationQuotaTransactions.filter((t) => t.operationType !== 'RESET')
      : backOfficeOrganizationQuotaTransactions;
    return collection(items, request);
  }),
];

/**
 * One customer workspace in the back office. The tabs are child routes, so the story mounts the
 * package's back-office routes and opens each tab by its address.
 */
const meta = {
  title: 'Screens/Back office/Organizations/Edit',
  component: AdminOrganizationsRoutes,
  parameters: {
    screen: {
      path: '/workspaces/*',
      url: `/workspaces/${BACK_OFFICE_ORGANIZATION_ID}/overview`,
      layout: 'bare',
      workspace: false,
    } satisfies ScreenParameters,
    msw: billingHandlers,
  },
} satisfies Meta<typeof AdminOrganizationsRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

/** Name, domain, 2FA requirement, SSO entitlement and connection (SAML, enforced). */
export const Profile: Story = { parameters: { screen: tab('profile') } };

/** Not entitled to single sign-on, 2FA not required: the entitlement switch alone. */
export const ProfileWithoutSso: Story = {
  parameters: {
    screen: tab('profile'),
    msw: [
      mock.body('/organizations/:organizationId', {
        ...backOfficeOrganization,
        mfaRequired: false,
        ssoAvailable: false,
        ssoStatus: 'none',
      }),
    ],
  },
};

export const Members: Story = { parameters: { screen: tab('members') } };

export const Subscriptions: Story = { parameters: { screen: tab('subscriptions') } };

export const Quotas: Story = { parameters: { screen: tab('quotas') } };

export const QuotaTransactions: Story = { parameters: { screen: tab('quota-transactions') } };

/** Reached from a quota's "View transactions": scoped to that quota, with a way back to all. */
export const QuotaTransactionsOfOneQuota: Story = {
  parameters: { screen: tab(`quota-transactions/${BACK_OFFICE_AI_QUOTA_ID}`) },
};

export const Loading: Story = { parameters: { msw: [mock.loading('/organizations/:organizationId')] } };
