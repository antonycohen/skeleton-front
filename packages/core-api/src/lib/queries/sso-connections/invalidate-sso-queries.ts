import { QueryClient } from '@tanstack/react-query';

/**
 * Everything a change to the connection, a domain or a certificate can show up in: the connection
 * itself, the workspace's domains, its SAML certificates, and the organization (`ssoAvailable` aside, the security page reads the
 * workspace through it, and the back office lists workspaces with their SSO state).
 *
 * Every SSO mutation invalidates the whole set rather than the one key it wrote, because the API's
 * side effects cross the resources: removing the last verified domain demotes the connection, and
 * saving trust material sends it back to draft.
 */
export const invalidateSsoQueries = (
  queryClient: QueryClient,
  organizationId: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['sso-connection', organizationId] });
  queryClient.invalidateQueries({ queryKey: ['sso-domains', organizationId] });
  queryClient.invalidateQueries({ queryKey: ['sso-certificates', organizationId] });
  queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
  queryClient.invalidateQueries({ queryKey: ['organizations'] });
};
