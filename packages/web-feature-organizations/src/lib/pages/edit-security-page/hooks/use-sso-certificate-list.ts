import { useGetSsoCertificates } from '@skeleton/core-api';

/** The API holds two at most; the page asks for a few more so a surprise would be visible. */
export const SSO_CERTIFICATES_LIMIT = 10;

/**
 * The SAML connection's certificates. Both the certificates card and the identity-provider form
 * need them — one to list them, the other to know whether a certificate has to be picked at all —
 * so they ask through this one hook: same parameters, same query key, one request.
 */
export function useSsoCertificateList(
  organizationId: string,
  enabled: boolean,
) {
  return useGetSsoCertificates(
    {
      staticParams: { organizationId },
      offset: 0,
      limit: SSO_CERTIFICATES_LIMIT,
      fields: {
        id: null,
        fingerprintSha256: null,
        subject: null,
        notBefore: null,
        notAfter: null,
        status: null,
        createdAt: null,
      },
    },
    { enabled: enabled && !!organizationId },
  );
}
