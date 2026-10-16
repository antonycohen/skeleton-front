import { describe, expect, it } from 'vitest';
import {
  buildSamlConnectionPayload,
  SAML_ATTRIBUTE_PRESETS,
  samlAttributePresetOf,
  ssoSamlConnectionFormSchema,
  SsoSamlConnectionFormValues,
} from './models';

const values = (
  overrides: Partial<SsoSamlConnectionFormValues> = {},
): SsoSamlConnectionFormValues =>
  ({
    protocol: 'saml',
    source: 'manual',
    idpMetadataUrl: '',
    idpMetadataXml: '',
    idpEntityId: 'http://www.okta.com/exk1abcd',
    idpSsoUrl: 'https://acme.okta.com/app/acme/exk1abcd/sso/saml',
    idpCertificate:
      '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----',
    idpSsoBinding: 'redirect',
    allowIdpInitiated: false,
    attributeEmail: '',
    attributeGivenName: '',
    attributeFamilyName: '',
    hasRegisteredCertificate: false,
    ...overrides,
  }) as SsoSamlConnectionFormValues;

describe('ssoSamlConnectionFormSchema', () => {
  it('asks only for the fields of the chosen source', () => {
    const metadataUrl = ssoSamlConnectionFormSchema.safeParse(
      values({
        source: 'metadata_url',
        idpMetadataUrl: 'https://acme.okta.com/app/exk1abcd/sso/saml/metadata',
        idpEntityId: '',
        idpSsoUrl: '',
        idpCertificate: '',
      }),
    );
    const pasted = ssoSamlConnectionFormSchema.safeParse(
      values({
        source: 'metadata_xml',
        idpMetadataXml: '<EntityDescriptor/>',
        idpEntityId: '',
        idpSsoUrl: '',
        idpCertificate: '',
      }),
    );

    expect(metadataUrl.success).toBe(true);
    expect(pasted.success).toBe(true);
  });

  it('refuses an empty or plain-http metadata address', () => {
    const empty = ssoSamlConnectionFormSchema.safeParse(
      values({ source: 'metadata_url', idpMetadataUrl: '' }),
    );
    const insecure = ssoSamlConnectionFormSchema.safeParse(
      values({
        source: 'metadata_url',
        idpMetadataUrl: 'http://acme.okta.com/metadata',
      }),
    );

    expect(empty.success).toBe(false);
    expect(empty.error?.issues[0]?.path).toEqual(['idpMetadataUrl']);
    expect(insecure.error?.issues[0]?.message).toBe('validation.sso.metadataUrlNotHttps');
  });

  // The sign-on address ends up in the action of a form on the login origin, which is why the API
  // refuses quotes and angle brackets there; the field says so instead of waiting for the 422.
  it('refuses a sign-on address carrying markup', () => {
    const parsed = ssoSamlConnectionFormSchema.safeParse(
      values({ idpSsoUrl: 'https://acme.okta.com/sso"><script>' }),
    );

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(['idpSsoUrl']);
  });

  it('asks for a certificate by hand, unless the connection already holds one', () => {
    const withoutCertificate = ssoSamlConnectionFormSchema.safeParse(
      values({ idpCertificate: '' }),
    );
    const alreadyRegistered = ssoSamlConnectionFormSchema.safeParse(
      values({ idpCertificate: '', hasRegisteredCertificate: true }),
    );

    expect(withoutCertificate.success).toBe(false);
    expect(withoutCertificate.error?.issues[0]?.path).toEqual([
      'idpCertificate',
    ]);
    expect(alreadyRegistered.success).toBe(true);
  });
});

describe('buildSamlConnectionPayload', () => {
  it('sends the metadata address alone, and lets the API read the rest from it', () => {
    const payload = buildSamlConnectionPayload(
      values({
        source: 'metadata_url',
        idpMetadataUrl: ' https://acme.okta.com/metadata ',
      }),
    );

    expect(payload).toEqual({
      protocol: 'saml',
      allowIdpInitiated: false,
      attributeEmail: '',
      attributeGivenName: '',
      attributeFamilyName: '',
      idpMetadataUrl: 'https://acme.okta.com/metadata',
    });
    expect(payload.idpMetadataXml).toBeUndefined();
    expect(payload.idpCertificate).toBeUndefined();
    expect(payload.idpEntityId).toBeUndefined();
  });

  // A document and a hand-filled provider describe the connection by themselves: an address left
  // behind would go on being watched, and its changes reported, for a provider nobody reads there.
  // It has to travel as an explicit null — `''` is refused by the pattern the API validates on the
  // body, and an absent key would keep the stored value through the PATCH merge base.
  it('clears a stored metadata address with null when the source no longer uses one', () => {
    const stored = 'https://acme.okta.com/metadata';

    const pasted = buildSamlConnectionPayload(
      values({
        source: 'metadata_xml',
        idpMetadataUrl: stored,
        idpMetadataXml: '<EntityDescriptor/>',
      }),
    );
    const byHand = buildSamlConnectionPayload(
      values({ idpMetadataUrl: stored }),
    );

    expect(pasted.idpMetadataUrl).toBeNull();
    expect(byHand.idpMetadataUrl).toBeNull();
  });

  it('leaves the address out entirely when there is none to clear', () => {
    const pasted = buildSamlConnectionPayload(
      values({ source: 'metadata_xml', idpMetadataXml: '<EntityDescriptor/>' }),
    );
    const byHand = buildSamlConnectionPayload(values());

    expect('idpMetadataUrl' in pasted).toBe(false);
    expect('idpMetadataUrl' in byHand).toBe(false);
  });

  // Every string the API validates with a pattern, a minimum length or an enum is either absent or
  // a real value: an empty one is a 422, whatever the service would have trimmed it to.
  it('never sends an empty string for a field the API validates', () => {
    const payloads = [
      buildSamlConnectionPayload(values({ source: 'metadata_url' })),
      buildSamlConnectionPayload(
        values({
          source: 'metadata_xml',
          idpMetadataXml: '<EntityDescriptor/>',
        }),
      ),
      buildSamlConnectionPayload(
        values({ idpCertificate: '   ', hasRegisteredCertificate: true }),
      ),
    ];

    for (const payload of payloads) {
      for (const field of [
        'protocol',
        'idpMetadataUrl',
        'idpMetadataXml',
        'idpEntityId',
        'idpSsoUrl',
        'idpCertificate',
        'idpSsoBinding',
      ] as const) {
        expect(payload[field]).not.toBe('');
      }
    }
  });

  it('never sends an empty certificate or document', () => {
    const payload = buildSamlConnectionPayload(
      values({ idpCertificate: '   ', hasRegisteredCertificate: true }),
    );

    expect('idpCertificate' in payload).toBe(false);
    expect('idpMetadataXml' in payload).toBe(false);
  });

  // Reading a metadata document sets the binding from what it announces, so a value sent beside it
  // is ignored at best and a contradiction at worst.
  it('sends the binding by hand only', () => {
    expect(
      buildSamlConnectionPayload(values({ idpSsoBinding: 'post' }))
        .idpSsoBinding,
    ).toBe('post');
    expect(
      'idpSsoBinding' in
        buildSamlConnectionPayload(
          values({ source: 'metadata_url', idpSsoBinding: 'post' }),
        ),
    ).toBe(false);
    expect(
      'idpSsoBinding' in
        buildSamlConnectionPayload(
          values({
            source: 'metadata_xml',
            idpMetadataXml: '<x/>',
            idpSsoBinding: 'post',
          }),
        ),
    ).toBe(false);
  });

  it('always carries the identity-provider-initiated choice and the attribute names', () => {
    const payload = buildSamlConnectionPayload(
      values({
        allowIdpInitiated: true,
        attributeEmail: ' email ',
        attributeGivenName: 'firstName',
        attributeFamilyName: 'lastName',
      }),
    );

    expect(payload).toMatchObject({
      allowIdpInitiated: true,
      attributeEmail: 'email',
      attributeGivenName: 'firstName',
      attributeFamilyName: 'lastName',
    });
  });

  // The attribute names are the one group where an empty string is right: they carry no pattern and
  // the service trims them to null, which is what asks for the common providers' names again.
  it('sends empty attribute names, which is how the defaults are asked for again', () => {
    const payload = buildSamlConnectionPayload(values());

    expect(payload.attributeEmail).toBe('');
    expect(payload.attributeGivenName).toBe('');
    expect(payload.attributeFamilyName).toBe('');
  });
});

describe('samlAttributePresetOf', () => {
  it('recognises the providers the presets name', () => {
    expect(samlAttributePresetOf(SAML_ATTRIBUTE_PRESETS.okta.values)).toBe(
      'okta',
    );
    expect(samlAttributePresetOf(SAML_ATTRIBUTE_PRESETS.entra.values)).toBe(
      'entra',
    );
    expect(samlAttributePresetOf(SAML_ATTRIBUTE_PRESETS.google.values)).toBe(
      'google',
    );
  });

  it('calls empty names the defaults, and anything else custom', () => {
    expect(
      samlAttributePresetOf({
        attributeEmail: '',
        attributeGivenName: '',
        attributeFamilyName: '',
      }),
    ).toBe('defaults');
    expect(
      samlAttributePresetOf({
        attributeEmail: 'mail',
        attributeGivenName: '',
        attributeFamilyName: '',
      }),
    ).toBe('custom');
  });
});
