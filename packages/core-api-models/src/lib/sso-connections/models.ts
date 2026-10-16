import * as z from 'zod';
import { SECURE_URL_SCHEME } from '../common';
import { readUserRefSchema } from '../users';
import {
  readSsoCertificateSchema,
  SSO_CERTIFICATE_MAX_LENGTH,
} from '../sso-certificates';

// Enums
// The connection is a singleton per workspace: one row, one lifecycle.
// `saml` is accepted by the API; the settings UI only offers `oidc` for now.
export const ssoProtocolEnum = z.enum(['oidc', 'saml']);
export type SsoProtocol = z.infer<typeof ssoProtocolEnum>;

// draft -> tested -> enabled -> enforced, one operation per step. Changing the trust material
// (protocol, issuer, client id) sends the connection back to `draft`; a new client secret does not.
export const ssoConnectionStatusEnum = z.enum([
  'draft',
  'tested',
  'enabled',
  'enforced',
]);
export type SsoConnectionStatus = z.infer<typeof ssoConnectionStatusEnum>;

/** Role given to someone created at their first sign-in. Never `admin`: admins are appointed by hand. */
export const ssoDefaultRoleEnum = z.enum(['editor', 'viewer']);
export type SsoDefaultRole = z.infer<typeof ssoDefaultRoleEnum>;

/** How the authentication request travels to the provider's sign-on address. */
export const ssoSamlBindingEnum = z.enum(['redirect', 'post']);
export type SsoSamlBinding = z.infer<typeof ssoSamlBindingEnum>;

/** The three shapes the API accepts for describing a SAML identity provider. */
export const ssoSamlSourceEnum = z.enum([
  'metadata_url',
  'metadata_xml',
  'manual',
]);
export type SsoSamlSource = z.infer<typeof ssoSamlSourceEnum>;

/**
 * Plain-HTTP identity-provider addresses (a Keycloak on localhost or on the isolated e2e stack) are
 * accepted only where the web app accepts insecure URLs at all: a DEV server started with
 * `VITE_ALLOW_INSECURE_URLS=true`, never a production build (see `ALLOWS_INSECURE_URLS`). The backend
 * has its own switch, `app.sso.oidc.allow-insecure-endpoints`, and must have it on too; the messages
 * keep saying "https", which is what an admin anywhere else must enter.
 */
const SCHEME = SECURE_URL_SCHEME;

/**
 * An https address the API accepts: no space, quote, angle bracket or backslash, because the
 * sign-on address ends up in the `action` of the form the login origin writes for the POST binding.
 * Mirrors the backend's own pattern so the message comes from the field rather than from a 422.
 */
const HTTPS_URL = new RegExp(`^${SCHEME}:\\/\\/[^\\s"'<>\\\\^\`{|}]+$`);

export const SSO_URL_MAX_LENGTH = 2048;
export const SSO_SAML_METADATA_XML_MAX_LENGTH = 1_048_576;
export const SSO_SAML_ATTRIBUTE_MAX_LENGTH = 255;

/** The bounds the API validates `sessionMaxAgeSeconds` against (8 hours to 7 days). */
export const SSO_SESSION_MIN_AGE_SECONDS = 28_800;
export const SSO_SESSION_MAX_AGE_SECONDS = 604_800;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readSsoConnectionRefSchema = z.object({
  id: z.uuid(),
  protocol: ssoProtocolEnum,
  status: ssoConnectionStatusEnum,
});
export type ReadSsoConnectionRef = z.infer<typeof readSsoConnectionRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const ssoConnectionRefSchema = z.object({
  id: z.uuid(),
});
export type SsoConnectionRef = z.infer<typeof ssoConnectionRefSchema>;

// 3. Read schema - all properties nullable (API response)
// The client secret is write-only: no response ever carries it, `clientSecretSet` only says
// whether one is stored.
export const readSsoConnectionSchema = z.object({
  id: z.uuid().nullable(),
  protocol: ssoProtocolEnum.nullable(),
  status: ssoConnectionStatusEnum.nullable(),
  defaultRole: ssoDefaultRoleEnum.nullable(),
  sessionMaxAgeSeconds: z.number().nullable(),
  jitEnabled: z.boolean().nullable(),
  issuer: z.string().nullable(),
  clientId: z.string().nullable(),
  clientSecretSet: z.boolean().nullable(),
  /** Read-only: the callback URI to register on the identity provider's side. */
  redirectUri: z.string().nullable(),
  // === SAML. Null on an OIDC connection, as `issuer` / `clientId` / `redirectUri` are on this one.
  idpEntityId: z.string().nullable(),
  idpSsoUrl: z.string().nullable(),
  idpSsoBinding: ssoSamlBindingEnum.nullable(),
  /** Given, it is read once and then only watched: certificates it announces are never applied by themselves. */
  idpMetadataUrl: z.string().nullable(),
  allowIdpInitiated: z.boolean().nullable(),
  /** Empty means the names of the common providers are tried; see `SAML_ATTRIBUTE_PRESETS`. */
  attributeEmail: z.string().nullable(),
  attributeGivenName: z.string().nullable(),
  attributeFamilyName: z.string().nullable(),
  /** Read-only: the three values to register on the identity provider's side. */
  spEntityId: z.string().nullable(),
  spAcsUrl: z.string().nullable(),
  spMetadataUrl: z.string().nullable(),
  /**
   * Read-only: the platform's certificate that verifies its signed authentication requests, as PEM,
   * for a provider that wants it pasted rather than read from the metadata. One per environment.
   */
  spCertificate: z.string().nullable(),
  spCertificateNotAfter: z.iso.datetime().nullable(),
  certificates: z.array(z.lazy(() => readSsoCertificateSchema)).nullable(),
  nearestCertificateExpiry: z.iso.datetime().nullable(),
  idpMetadataCheckedAt: z.iso.datetime().nullable(),
  /** Non-null: the provider's metadata announces other certificates than the registered ones. */
  idpMetadataChangedAt: z.iso.datetime().nullable(),
  lastTestedAt: z.iso.datetime().nullable(),
  lastTestedBy: z.lazy(() => readUserRefSchema).nullable(),
  enforcedAt: z.iso.datetime().nullable(),
  /** Who required single sign-on — a workspace admin, or platform support acting for them. */
  enforcedBy: z.lazy(() => readUserRefSchema).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadSsoConnection = z.infer<typeof readSsoConnectionSchema>;

/** The one-time link a test sign-in is run from (ten minutes, one use). */
export const readSsoTestSignInSchema = z.object({
  url: z.string().nullable(),
  expiresAt: z.iso.datetime().nullable(),
});
export type ReadSsoTestSignIn = z.infer<typeof readSsoTestSignInSchema>;

// 4. Create schema - what a PUT carries to create the connection.
// Split per protocol so that the SAML form adds its own member instead of bending this one; the
// identity-provider card picks the schema from the protocol the admin selected.
export const createSsoOidcConnectionSchema = z.object({
  protocol: z.literal('oidc'),
  issuer: z
    .string()
    .min(1, 'validation.sso.issuerRequired')
    .max(2048, 'validation.sso.issuerTooLong')
    .regex(new RegExp(`^${SCHEME}:\\/\\/\\S+$`), 'validation.sso.issuerNotHttps'),
  clientId: z
    .string()
    .min(1, 'validation.sso.clientIdRequired')
    .max(512, 'validation.sso.clientIdTooLong'),
  clientSecret: z
    .string()
    .min(1, 'validation.sso.clientSecretRequired')
    .max(2048, 'validation.sso.clientSecretTooLong'),
});
export type CreateSsoOidcConnection = z.infer<
  typeof createSsoOidcConnectionSchema
>;

// 5. Update schema - the PATCH payloads, one per group of settings the UI saves together.
// The trust material sends the connection back to `draft`; the provisioning settings do not.
export const updateSsoOidcConnectionSchema =
  createSsoOidcConnectionSchema.extend({
    // Left out, the stored secret is kept: the admin never has to retype it to change the issuer.
    clientSecret: createSsoOidcConnectionSchema.shape.clientSecret.optional(),
  });
export type UpdateSsoOidcConnection = z.infer<
  typeof updateSsoOidcConnectionSchema
>;

/**
 * What the identity-provider form validates. The client secret may stay empty when the API already
 * stores one (`clientSecretSet`): saving without retyping it keeps the stored secret. The flag is a
 * form value rather than a resolver argument so the rule lives in the schema, next to the field.
 */
export const ssoOidcConnectionFormSchema = z
  .object({
    protocol: z.literal('oidc'),
    issuer: createSsoOidcConnectionSchema.shape.issuer,
    clientId: createSsoOidcConnectionSchema.shape.clientId,
    clientSecret: z
      .string()
      .max(2048, 'validation.sso.clientSecretTooLong')
      .optional(),
    clientSecretSet: z.boolean(),
  })
  .refine((values) => values.clientSecretSet || !!values.clientSecret, {
    message: 'validation.sso.clientSecretRequired',
    path: ['clientSecret'],
  });
export type SsoOidcConnectionFormValues = z.infer<
  typeof ssoOidcConnectionFormSchema
>;

/**
 * What the SAML form validates. One schema for the three ways of describing a provider, because
 * they are one form with a source picker: `source` says which fields are asked for, and the checks
 * below are the API's own, said at the field instead of coming back as a 422.
 *
 * `hasRegisteredCertificate` plays the part `clientSecretSet` plays for OIDC: a connection that
 * already holds a certificate is saved again without picking one.
 */
export const ssoSamlConnectionFormSchema = z
  .object({
    protocol: z.literal('saml'),
    source: ssoSamlSourceEnum,
    idpMetadataUrl: z.string().optional(),
    idpMetadataXml: z.string().optional(),
    idpEntityId: z.string().optional(),
    idpSsoUrl: z.string().optional(),
    idpCertificate: z.string().optional(),
    idpSsoBinding: ssoSamlBindingEnum,
    allowIdpInitiated: z.boolean(),
    attributeEmail: z
      .string()
      .max(SSO_SAML_ATTRIBUTE_MAX_LENGTH, 'validation.sso.attributeNameTooLong'),
    attributeGivenName: z
      .string()
      .max(SSO_SAML_ATTRIBUTE_MAX_LENGTH, 'validation.sso.attributeNameTooLong'),
    attributeFamilyName: z
      .string()
      .max(SSO_SAML_ATTRIBUTE_MAX_LENGTH, 'validation.sso.attributeNameTooLong'),
    hasRegisteredCertificate: z.boolean(),
  })
  .superRefine((values, context) => {
    const tooLong = (value: string, max: number) => value.length > max;
    const require = (path: string, message: string) =>
      context.addIssue({ code: 'custom', path: [path], message });

    if (values.source === 'metadata_url') {
      const url = values.idpMetadataUrl?.trim() ?? '';
      if (!url) {
        require('idpMetadataUrl', 'validation.sso.metadataUrlRequired');
      } else if (!HTTPS_URL.test(url)) {
        require('idpMetadataUrl', 'validation.sso.metadataUrlNotHttps');
      } else if (tooLong(url, SSO_URL_MAX_LENGTH)) {
        require('idpMetadataUrl', 'validation.sso.metadataUrlTooLong');
      }
      return;
    }

    if (values.source === 'metadata_xml') {
      const xml = values.idpMetadataXml?.trim() ?? '';
      if (!xml) {
        require('idpMetadataXml', 'validation.sso.metadataXmlRequired');
      } else if (tooLong(xml, SSO_SAML_METADATA_XML_MAX_LENGTH)) {
        require('idpMetadataXml', 'validation.sso.metadataXmlTooLarge');
      }
      return;
    }

    const entityId = values.idpEntityId?.trim() ?? '';
    if (!entityId) {
      require('idpEntityId', 'validation.sso.entityIdRequired');
    } else if (tooLong(entityId, SSO_URL_MAX_LENGTH)) {
      require('idpEntityId', 'validation.sso.entityIdTooLong');
    }

    const ssoUrl = values.idpSsoUrl?.trim() ?? '';
    if (!ssoUrl) {
      require('idpSsoUrl', 'validation.sso.ssoUrlRequired');
    } else if (!HTTPS_URL.test(ssoUrl)) {
      require('idpSsoUrl', 'validation.sso.ssoUrlNotHttps');
    } else if (tooLong(ssoUrl, SSO_URL_MAX_LENGTH)) {
      require('idpSsoUrl', 'validation.sso.ssoUrlTooLong');
    }

    const certificate = values.idpCertificate?.trim() ?? '';
    if (!certificate && !values.hasRegisteredCertificate) {
      require('idpCertificate', 'validation.sso.certificateRequired');
    } else if (tooLong(certificate, SSO_CERTIFICATE_MAX_LENGTH)) {
      require('idpCertificate', 'validation.sso.certificateTooLarge');
    }
  });
export type SsoSamlConnectionFormValues = z.infer<
  typeof ssoSamlConnectionFormSchema
>;

/**
 * The payload of a SAML save. Only the chosen source's fields travel: the API reads a pasted
 * document or a new metadata address over whatever else was sent, and a write-only field (the
 * document, the certificate) is never sent empty — an empty one would be a refusal, not a "leave
 * it as it is".
 *
 * Two shapes are deliberate, and both are what the API's validation accepts:
 *
 * - a metadata address the connection no longer describes itself by is cleared with an explicit
 *   `null`, so the daily re-read stops watching it. `''` would be refused by the `@Pattern` on the
 *   body, which runs before the service trims anything; a key left out would keep the stored value,
 *   the PATCH merge base holding it.
 * - the sign-on binding is sent by hand only: reading a metadata document sets it from what the
 *   document announces, so sending one beside it is at best ignored and at worst a contradiction.
 *
 * The attribute names travel even when empty: that is how the names of the common providers are
 * asked for again, and they carry no pattern (`@Size(max)` only, trimmed to null by the service).
 */
export function buildSamlConnectionPayload(
  values: SsoSamlConnectionFormValues,
): SaveSsoConnection {
  const common: SaveSsoConnection = {
    protocol: 'saml',
    allowIdpInitiated: values.allowIdpInitiated,
    attributeEmail: values.attributeEmail.trim(),
    attributeGivenName: values.attributeGivenName.trim(),
    attributeFamilyName: values.attributeFamilyName.trim(),
  };
  // Only worth clearing when the form still carries the address the connection was saved with.
  const clearMetadataUrl = values.idpMetadataUrl?.trim()
    ? { idpMetadataUrl: null }
    : {};

  if (values.source === 'metadata_url') {
    const address = values.idpMetadataUrl?.trim();

    // The schema will not let an empty address through, and the builder does not send one either:
    // no field the API validates with a pattern ever travels as `''`.
    return { ...common, ...(address ? { idpMetadataUrl: address } : {}) };
  }

  if (values.source === 'metadata_xml') {
    return {
      ...common,
      ...clearMetadataUrl,
      idpMetadataXml: values.idpMetadataXml?.trim(),
    };
  }

  const certificate = values.idpCertificate?.trim();

  return {
    ...common,
    ...clearMetadataUrl,
    idpSsoBinding: values.idpSsoBinding,
    idpEntityId: values.idpEntityId?.trim(),
    idpSsoUrl: values.idpSsoUrl?.trim(),
    ...(certificate ? { idpCertificate: certificate } : {}),
  };
}

export const samlAttributePresetEnum = z.enum([
  'defaults',
  'okta',
  'entra',
  'google',
  'custom',
]);
export type SamlAttributePreset = z.infer<typeof samlAttributePresetEnum>;

export type SamlAttributeNames = {
  attributeEmail: string;
  attributeGivenName: string;
  attributeFamilyName: string;
};

/**
 * The attribute names of the providers the product supports. Every one of them is a name the API
 * already tries when the connection names none (`SamlAttributeNames` on the backend), so a preset
 * only spells out what "leave empty" would have found — useful when a provider sends several of
 * them and the admin wants one named.
 */
export const SAML_ATTRIBUTE_PRESETS: Record<
  Exclude<SamlAttributePreset, 'custom'>,
  { label: string; values: SamlAttributeNames }
> = {
  defaults: {
    label: 'Detect them automatically',
    values: {
      attributeEmail: '',
      attributeGivenName: '',
      attributeFamilyName: '',
    },
  },
  okta: {
    label: 'Okta',
    values: {
      attributeEmail: 'email',
      attributeGivenName: 'firstName',
      attributeFamilyName: 'lastName',
    },
  },
  entra: {
    label: 'Microsoft Entra ID',
    values: {
      attributeEmail:
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      attributeGivenName:
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      attributeFamilyName:
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    },
  },
  google: {
    label: 'Google Workspace',
    values: {
      attributeEmail: 'email',
      attributeGivenName: 'first_name',
      attributeFamilyName: 'last_name',
    },
  },
};

/** Which preset the connection's attribute names are, `custom` when they are nobody's. */
export function samlAttributePresetOf(
  names: SamlAttributeNames,
): SamlAttributePreset {
  const match = (
    Object.keys(SAML_ATTRIBUTE_PRESETS) as Exclude<
      SamlAttributePreset,
      'custom'
    >[]
  ).find((preset) => {
    const { values } = SAML_ATTRIBUTE_PRESETS[preset];
    return (
      values.attributeEmail === names.attributeEmail &&
      values.attributeGivenName === names.attributeGivenName &&
      values.attributeFamilyName === names.attributeFamilyName
    );
  });

  return match ?? 'custom';
}

/**
 * What the provisioning form validates. The session length is one of the offered values rather than
 * a free number: the select holds exactly what the API accepts, and the submit turns it into seconds.
 */
export const ssoProvisioningFormSchema = z.object({
  defaultRole: ssoDefaultRoleEnum,
  sessionMaxAgeSeconds: z.enum(['28800', '86400', '259200', '604800']),
  jitEnabled: z.boolean(),
});
export type SsoProvisioningFormValues = z.infer<
  typeof ssoProvisioningFormSchema
>;

export const updateSsoConnectionProvisioningSchema = z.object({
  defaultRole: ssoDefaultRoleEnum,
  sessionMaxAgeSeconds: z
    .number()
    .min(SSO_SESSION_MIN_AGE_SECONDS, 'validation.sso.sessionTooShort')
    .max(SSO_SESSION_MAX_AGE_SECONDS, 'validation.sso.sessionTooLong'),
  jitEnabled: z.boolean(),
});
export type UpdateSsoConnectionProvisioning = z.infer<
  typeof updateSsoConnectionProvisioningSchema
>;

/**
 * Everything a PUT or a PATCH of the connection may carry: the union of what the schemas above
 * validate, every field optional, since a PATCH sends whichever few fields a card owns. Derived
 * rather than spelled out, so a field added to a form's schema cannot be forgotten here. The form-only
 * values (`source`, `hasRegisteredCertificate`, `clientSecretSet`) never travel.
 */
export type SaveSsoConnection = Partial<
  Omit<UpdateSsoOidcConnection, 'protocol'> &
    UpdateSsoConnectionProvisioning &
    Omit<
      SsoSamlConnectionFormValues,
      'protocol' | 'source' | 'hasRegisteredCertificate' | 'idpMetadataUrl'
    >
> & {
  protocol?: SsoProtocol;
  /**
   * `null` clears the stored address. Never `''`: the API validates `@Pattern(https://…)` on the
   * body before it trims anything, and Bean Validation skips `null` but refuses an empty string.
   */
  idpMetadataUrl?: string | null;
};

// Legacy exports
export const ssoConnectionSchema = readSsoConnectionSchema;
export type SsoConnection = ReadSsoConnection;
