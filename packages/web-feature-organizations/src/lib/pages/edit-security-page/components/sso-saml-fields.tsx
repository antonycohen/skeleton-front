import { Controller, useFormContext } from 'react-hook-form';
import {
  Alert,
  AlertDescription,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skeleton/web-components';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import {
  SAML_ATTRIBUTE_PRESETS,
  SamlAttributePreset,
  samlAttributePresetOf,
  SSO_CERTIFICATE_MAX_LENGTH,
  SSO_SAML_METADATA_XML_MAX_LENGTH,
  SsoSamlBinding,
  SsoSamlConnectionFormValues,
  SsoSamlSource,
} from '@skeleton/core-api-models';
import { InfoIcon } from 'lucide-react';
import { toPemCertificate } from '../certificate-file';
import { FileOrPasteInput } from './file-or-paste-input';
import { useTranslation } from '@skeleton/core-translations';

const { ControlledTextInput, ControlledSelectInput, ControlledSwitchInput } =
  createConnectedInputHelpers<SsoSamlConnectionFormValues>();

const SOURCES: { value: SsoSamlSource; labelKey: string; hintKey: string }[] =
  [
    {
      value: 'metadata_url',
      labelKey: 'security.saml.sources.metadataUrl',
      hintKey: 'security.saml.sources.metadataUrlHint',
    },
    {
      value: 'metadata_xml',
      labelKey: 'security.saml.sources.metadataXml',
      hintKey: 'security.saml.sources.metadataXmlHint',
    },
    {
      value: 'manual',
      labelKey: 'security.saml.sources.manual',
      hintKey: 'security.saml.sources.manualHint',
    },
  ];

const BINDING_LABEL_KEYS: Record<SsoSamlBinding, string> = {
  redirect: 'security.saml.bindings.redirect',
  post: 'security.saml.bindings.post',
};

/** The presets' labels, by preset id: the model's own `label` is not translated. */
const PRESET_LABEL_KEYS: Record<SamlAttributePreset, string> = {
  defaults: 'security.saml.attributePresets.defaults',
  okta: 'security.saml.attributePresets.okta',
  entra: 'security.saml.attributePresets.entra',
  google: 'security.saml.attributePresets.google',
  custom: 'security.saml.attributePresets.custom',
};

const PRESETS: SamlAttributePreset[] = [
  ...(Object.keys(SAML_ATTRIBUTE_PRESETS) as Exclude<
    SamlAttributePreset,
    'custom'
  >[]),
  'custom',
];

const decodeText = (bytes: Uint8Array) =>
  new TextDecoder().decode(bytes).trim();

/**
 * The SAML half of the identity-provider form. The source picker decides which fields are asked
 * for, because the API accepts exactly one of the three descriptions — and reads a metadata document
 * over anything else that was sent.
 */
export function SsoSamlFields() {
  const { t, tIfKey } = useTranslation();
  const form = useFormContext<SsoSamlConnectionFormValues>();
  const source = form.watch('source');
  const attributeNames = {
    attributeEmail: form.watch('attributeEmail'),
    attributeGivenName: form.watch('attributeGivenName'),
    attributeFamilyName: form.watch('attributeFamilyName'),
  };
  const preset = samlAttributePresetOf(attributeNames);

  const bindingOptions = [
    { value: 'redirect', label: t('security.saml.bindings.redirectDefault') },
    { value: 'post', label: t('security.saml.bindings.post') },
  ];

  const applyPreset = (chosen: SamlAttributePreset) => {
    if (chosen === 'custom') return;
    const { values } = SAML_ATTRIBUTE_PRESETS[chosen];
    form.setValue('attributeEmail', values.attributeEmail, {
      shouldDirty: true,
    });
    form.setValue('attributeGivenName', values.attributeGivenName, {
      shouldDirty: true,
    });
    form.setValue('attributeFamilyName', values.attributeFamilyName, {
      shouldDirty: true,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Label>{t('security.saml.idpValues')}</Label>
        <Controller
          control={form.control}
          name="source"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="gap-3"
            >
              {SOURCES.map((option) => (
                <div key={option.value} className="flex items-start gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`sso-saml-source-${option.value}`}
                    aria-label={t(option.labelKey)}
                    className="mt-1"
                  />
                  <div className="flex flex-col">
                    <Label
                      htmlFor={`sso-saml-source-${option.value}`}
                      className="font-normal"
                    >
                      {t(option.labelKey)}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {t(option.hintKey)}
                    </span>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </div>

      {source === 'metadata_url' && (
        <ControlledTextInput
          name="idpMetadataUrl"
          label={t('security.saml.sources.metadataUrl')}
          placeholder="https://acme.okta.com/app/exk1abcd/sso/saml/metadata"
          description={t('security.saml.metadataUrlHint')}
        />
      )}

      {source === 'metadata_xml' && (
        <Controller
          control={form.control}
          name="idpMetadataXml"
          render={({ field, fieldState }) => (
            <FileOrPasteInput
              id="sso-saml-metadata-xml"
              label={t('security.saml.sources.metadataXml')}
              accept=".xml,text/xml,application/xml"
              placeholder="<EntityDescriptor …>"
              description={t('security.saml.metadataXmlHint')}
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maxLength={SSO_SAML_METADATA_XML_MAX_LENGTH}
              readBytes={decodeText}
              error={tIfKey(fieldState.error?.message)}
            />
          )}
        />
      )}

      {source === 'manual' && (
        <>
          <ControlledTextInput
            name="idpEntityId"
            label={t('security.saml.idpEntityId')}
            placeholder="http://www.okta.com/exk1abcd"
            description={t('security.saml.idpEntityIdHint')}
          />
          <ControlledTextInput
            name="idpSsoUrl"
            label={t('security.saml.idpSsoUrl')}
            placeholder="https://acme.okta.com/app/acme/exk1abcd/sso/saml"
          />
          <Controller
            control={form.control}
            name="idpCertificate"
            render={({ field, fieldState }) => (
              <FileOrPasteInput
                id="sso-saml-certificate"
                label={t('security.saml.idpCertificate')}
                accept=".pem,.cer,.crt,application/x-x509-ca-cert,application/pkix-cert"
                placeholder="-----BEGIN CERTIFICATE-----"
                description={t('security.saml.idpCertificateHint')}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                maxLength={SSO_CERTIFICATE_MAX_LENGTH}
                readBytes={toPemCertificate}
                error={tIfKey(fieldState.error?.message)}
              />
            )}
          />
        </>
      )}

      {/* The binding is only ours to choose by hand: reading a metadata document sets it from what
          the document announces, so offering a control beside it would promise what it cannot keep. */}
      {source === 'manual' ? (
        <ControlledSelectInput
          name="idpSsoBinding"
          label={t('security.saml.binding')}
          options={bindingOptions}
          description={t('security.saml.bindingHint')}
          direction="horizontal"
        />
      ) : (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold">
            {t('security.saml.binding')}
          </span>
          <span className="text-sm text-muted-foreground">
            {t('security.saml.bindingFromMetadata', {
              binding: t(BINDING_LABEL_KEYS[form.getValues('idpSsoBinding')]),
            })}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label
              htmlFor="sso-saml-attribute-preset"
              className="font-semibold"
            >
              {t('security.saml.attributeNames')}
            </Label>
            <span className="text-sm text-muted-foreground">
              {t('security.saml.attributeNamesHint')}
            </span>
          </div>
          <Select
            value={preset}
            onValueChange={(value) => applyPreset(value as SamlAttributePreset)}
          >
            <SelectTrigger id="sso-saml-attribute-preset" className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((value) => (
                <SelectItem
                  key={value}
                  value={value}
                  // "Custom" is what the fields below say, not something to pick.
                  disabled={value === 'custom'}
                >
                  {t(PRESET_LABEL_KEYS[value])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ControlledTextInput
          name="attributeEmail"
          label={t('security.saml.attributeEmail')}
          placeholder="email"
        />
        <ControlledTextInput
          name="attributeGivenName"
          label={t('security.saml.attributeGivenName')}
          placeholder="firstName"
        />
        <ControlledTextInput
          name="attributeFamilyName"
          label={t('security.saml.attributeFamilyName')}
          placeholder="lastName"
        />
      </div>

      <div className="flex flex-col gap-3 border-t pt-6">
        <ControlledSwitchInput
          name="allowIdpInitiated"
          label={t('security.saml.allowIdpInitiated')}
          description={t('security.saml.allowIdpInitiatedHint')}
        />
      </div>

      <Alert>
        <InfoIcon />
        <AlertDescription>{t('security.saml.trustNotice')}</AlertDescription>
      </Alert>
    </>
  );
}
