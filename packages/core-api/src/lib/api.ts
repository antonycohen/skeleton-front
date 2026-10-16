import {ApiClient, ApiClientConfig} from './api-client/api-client';
import {AiConversationsEndpoint} from './endpoints/ai-conversations';
import {AppConfigurationEndpoint} from './endpoints/app-configuration';
import {CustomerPortalEndpoint} from './endpoints/customer-portal';
import {CustomersEndpoint} from './endpoints/customers';
import {JobsEndpoint} from './endpoints/jobs';
import {OrganizationsEndpoint} from './endpoints/organizations';
import {OrganizationMembersEndpoint} from './endpoints/organization-members';
import {PricesEndpoint} from './endpoints/prices';
import {ProductGroupsEndpoint} from './endpoints/product-groups';
import {QuotasEndpoint} from './endpoints/quotas';
import {QuotaTransactionsEndpoint} from './endpoints/quota-transactions';
import {ProductsEndpoint} from './endpoints/products';
import {ServiceAccountsEndpoint} from './endpoints/service-accounts';
import {SsoCertificatesEndpoint} from './endpoints/sso-certificates';
import {SsoConnectionsEndpoint} from './endpoints/sso-connections';
import {SsoDomainsEndpoint} from './endpoints/sso-domains';
import {SubscriptionsEndpoint} from './endpoints/subscriptions';
import {UsersEndpoint} from './endpoints/users';

class SkeletonApi {
  private readonly client: ApiClient;
  public readonly aiConversations: AiConversationsEndpoint;
  public readonly appConfiguration: AppConfigurationEndpoint;
  public readonly customerPortal: CustomerPortalEndpoint;
  public readonly customers: CustomersEndpoint;
  public readonly jobs: JobsEndpoint;
  public readonly organizations: OrganizationsEndpoint;
  public readonly organizationMembers: OrganizationMembersEndpoint;
  public readonly prices: PricesEndpoint;
  public readonly productGroups: ProductGroupsEndpoint;
  public readonly products: ProductsEndpoint;
  public readonly quotas: QuotasEndpoint;
  public readonly quotaTransactions: QuotaTransactionsEndpoint;
  public readonly serviceAccounts: ServiceAccountsEndpoint;
  public readonly ssoCertificates: SsoCertificatesEndpoint;
  public readonly ssoConnections: SsoConnectionsEndpoint;
  public readonly ssoDomains: SsoDomainsEndpoint;
  public readonly subscriptions: SubscriptionsEndpoint;
  public readonly users: UsersEndpoint;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);
    this.aiConversations = new AiConversationsEndpoint(this.client);
    this.appConfiguration = new AppConfigurationEndpoint(this.client);
    this.customerPortal = new CustomerPortalEndpoint(this.client);
    this.customers = new CustomersEndpoint(this.client);
    this.jobs = new JobsEndpoint(this.client);
    this.organizations = new OrganizationsEndpoint(this.client);
    this.organizationMembers = new OrganizationMembersEndpoint(this.client);
    this.prices = new PricesEndpoint(this.client);
    this.productGroups = new ProductGroupsEndpoint(this.client);
    this.products = new ProductsEndpoint(this.client);
    this.quotas = new QuotasEndpoint(this.client);
    this.quotaTransactions = new QuotaTransactionsEndpoint(this.client);
    this.serviceAccounts = new ServiceAccountsEndpoint(this.client);
    this.ssoCertificates = new SsoCertificatesEndpoint(this.client);
    this.ssoConnections = new SsoConnectionsEndpoint(this.client);
    this.ssoDomains = new SsoDomainsEndpoint(this.client);
    this.subscriptions = new SubscriptionsEndpoint(this.client);
    this.users = new UsersEndpoint(this.client);
  }
}

export type { ApiClientConfig } from './api-client/api-client';
export { ApiError } from './api-client/api-error';
export * from './endpoints/users';

export const skeletonApi = new SkeletonApi({
  baseUrl: `${import.meta.env['VITE_API_URL']}` || 'https://localhost:8080',
});
