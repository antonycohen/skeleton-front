import { http, type HttpHandler } from 'msw';
import { api, collection, json } from '../api';
import {
  BACK_OFFICE_ORGANIZATION_ID,
  backOfficeOrganization,
  backOfficeOrganizationMembers,
  backOfficeOrganizations,
  backOfficeSsoConnection,
  backOfficeSsoDomains,
  organizationMembers,
  serviceAccountPermissionCatalog,
  serviceAccounts,
  ssoCertificates,
  ssoDomains,
  ssoOidcConnection,
  userOrganizations,
} from '../../fixtures/organizations';
import { daysFromNow } from '../../fixtures/make';

const isBackOffice = (params: Record<string, unknown>) => params['organizationId'] === BACK_OFFICE_ORGANIZATION_ID;

const matches = (value: unknown, term: string) => String(value ?? '').toLowerCase().includes(term.toLowerCase());

/** Default handlers for the organizations domain (fixtures in ../../fixtures/organizations.ts). */
export const organizationsHandlers: HttpHandler[] = [
  // Back office: every customer workspace, searchable by name or domain.
  http.get(api('/organizations'), ({ request }) => {
    const term = new URL(request.url).searchParams.get('term');
    const items = term ? backOfficeOrganizations.filter((o) => matches(o.name, term) || matches(o.domain, term)) : backOfficeOrganizations;
    return collection(items, request);
  }),

  // The open workspace is answered by the session handlers; these are the others (back office, Workspaces list).
  http.get(api('/organizations/:organizationId'), ({ params }) => {
    if (isBackOffice(params)) return json(backOfficeOrganization);
    const known = [...userOrganizations, ...backOfficeOrganizations].find((o) => o.id === params['organizationId']);
    return known ? json(known) : undefined;
  }),

  http.get(api('/organizations/:organizationId/members'), ({ request, params }) => {
    const search = new URL(request.url).searchParams;
    const term = search.get('term');
    // Facets travel as `status[]=INVITED` (axios' array format), or comma-separated.
    const facet = (name: string) => [...search.getAll(name), ...search.getAll(`${name}[]`)].flatMap((v) => v.split(','));
    const roles = facet('role');
    const statuses = facet('status').map((s) => s.toLowerCase());
    const items = (isBackOffice(params) ? backOfficeOrganizationMembers : organizationMembers).filter(
      (m) =>
        (!term || matches(`${m.firstName ?? ''} ${m.lastName ?? ''} ${m.email}`, term)) &&
        (roles.length === 0 || roles.includes(m.role as string)) &&
        (statuses.length === 0 || statuses.includes(m.status as string)),
    );
    return collection(items, request);
  }),

  // Service accounts.
  http.get(api('/organizations/:organizationId/service-accounts/permission-catalog'), () =>
    json(serviceAccountPermissionCatalog),
  ),
  http.get(api('/organizations/:organizationId/service-accounts'), ({ request }) => collection(serviceAccounts, request)),

  // Single sign-on: an OIDC connection on the open workspace, an enforced SAML one in the back office.
  http.get(api('/organizations/:organizationId/sso-connection'), ({ params }) =>
    json(isBackOffice(params) ? backOfficeSsoConnection : ssoOidcConnection),
  ),
  http.get(api('/organizations/:organizationId/sso-connection/certificates'), ({ request }) =>
    collection(ssoCertificates, request),
  ),
  http.post(api('/organizations/:organizationId/sso-connection/test'), () =>
    json({ url: 'https://auth.example.com/sso/test/7f3c2a', expiresAt: daysFromNow(0) }),
  ),
  http.get(api('/organizations/:organizationId/sso-domains'), ({ request, params }) =>
    collection(isBackOffice(params) ? backOfficeSsoDomains : ssoDomains, request),
  ),
];
