import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The switch is read when the module loads, so each case stubs the environment and imports a fresh
 * copy of it.
 */
const loadModels = async (allowInsecure: string | undefined) => {
  vi.resetModules();
  vi.stubEnv('VITE_ALLOW_INSECURE_URLS', allowInsecure);
  return { ...(await import('./models')), ...(await import('../common')) };
};

type Models = Awaited<ReturnType<typeof loadModels>>;

/** A SAML form described by its metadata address, the other fields left empty. */
const samlByMetadataUrl = (models: Models, idpMetadataUrl: string) =>
  models.ssoSamlConnectionFormSchema.safeParse({
    protocol: 'saml',
    source: 'metadata_url',
    idpMetadataUrl,
    idpMetadataXml: '',
    idpEntityId: '',
    idpSsoUrl: '',
    idpCertificate: '',
    idpSsoBinding: 'redirect',
    allowIdpInitiated: false,
    attributeEmail: '',
    attributeGivenName: '',
    attributeFamilyName: '',
    hasRegisteredCertificate: false,
  });

/** A SAML form described by hand, with the given sign-on address. */
const samlBySsoUrl = (models: Models, idpSsoUrl: string) =>
  models.ssoSamlConnectionFormSchema.safeParse({
    protocol: 'saml',
    source: 'manual',
    idpMetadataUrl: '',
    idpMetadataXml: '',
    idpEntityId: 'http://www.okta.com/exk1abcd',
    idpSsoUrl,
    idpCertificate: '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----',
    idpSsoBinding: 'redirect',
    allowIdpInitiated: false,
    attributeEmail: '',
    attributeGivenName: '',
    attributeFamilyName: '',
    hasRegisteredCertificate: false,
  });

const ISSUER = 'http://localhost:8180/realms/acme';
const METADATA_URL = 'http://localhost:8180/realms/acme/protocol/saml/descriptor';
const SSO_URL = 'http://localhost:8180/realms/acme/protocol/saml';

describe('SSO provider addresses and VITE_ALLOW_INSECURE_URLS', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('refuses plain-HTTP provider addresses by default', async () => {
    const models = await loadModels(undefined);

    expect(models.ALLOWS_INSECURE_URLS).toBe(false);
    const result = models.createSsoOidcConnectionSchema.shape.issuer.safeParse(ISSUER);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('validation.sso.issuerNotHttps');
    expect(samlByMetadataUrl(models, METADATA_URL).success).toBe(false);
    expect(samlBySsoUrl(models, SSO_URL).success).toBe(false);
    // The https forms stay valid.
    expect(samlByMetadataUrl(models, METADATA_URL.replace('http:', 'https:')).success).toBe(true);
  });

  it('accepts plain-HTTP provider addresses on a dev server started with the flag', async () => {
    const models = await loadModels('true');

    expect(models.ALLOWS_INSECURE_URLS).toBe(true);
    expect(models.createSsoOidcConnectionSchema.shape.issuer.safeParse(ISSUER).success).toBe(true);
    expect(samlByMetadataUrl(models, METADATA_URL).success).toBe(true);
    expect(samlBySsoUrl(models, SSO_URL).success).toBe(true);
    // Still a URL: anything else is refused whatever the flag.
    expect(models.createSsoOidcConnectionSchema.shape.issuer.safeParse('localhost:8180').success).toBe(
      false,
    );
  });

  it('never accepts plain HTTP in a production build, whatever the flag says', async () => {
    vi.stubEnv('DEV', false);
    const models = await loadModels('true');

    expect(models.ALLOWS_INSECURE_URLS).toBe(false);
    expect(models.createSsoOidcConnectionSchema.shape.issuer.safeParse(ISSUER).success).toBe(false);
  });

  it('ignores the former SSO-only variable', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SSO_ALLOW_INSECURE_ENDPOINTS', 'true');
    const models = { ...(await import('./models')), ...(await import('../common')) };

    expect(models.ALLOWS_INSECURE_URLS).toBe(false);
  });
});
