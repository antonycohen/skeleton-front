import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Skeleton,
} from '@skeleton/web-components';
import { ReadSsoConnection, SsoProtocol } from '@skeleton/core-api-models';
import { SwitchSsoProtocolModal } from '../modals/switch-sso-protocol-modal';
import { SsoOidcConnectionForm } from './sso-oidc-connection-form';
import { SsoSamlConnectionForm } from './sso-saml-connection-form';
import { useTranslation } from '@skeleton/core-translations';

// The protocol names are proper nouns: only their hints are translated.
const PROTOCOLS: { value: SsoProtocol; label: string; hintKey: string }[] = [
  {
    value: 'oidc',
    label: 'OpenID Connect',
    hintKey: 'security.idp.protocols.oidcHint',
  },
  {
    value: 'saml',
    label: 'SAML 2.0',
    hintKey: 'security.idp.protocols.samlHint',
  },
];

export type SsoIdentityProviderCardProps = {
  organizationId: string;
  connection: ReadSsoConnection | undefined;
  isLoading: boolean;
};

/**
 * Where the admin describes their identity provider. The protocol decides which fields are asked
 * for, so each one has its own form: changing it on an existing connection is a change of trust, and
 * is confirmed before the form is swapped.
 */
export function SsoIdentityProviderCard({
  organizationId,
  connection,
  isLoading,
}: SsoIdentityProviderCardProps) {
  const { t } = useTranslation();
  // The protocol the admin is filling in, which is the connection's until they pick the other one.
  const [chosenProtocol, setChosenProtocol] = useState<SsoProtocol | null>(
    null,
  );
  const [protocolToConfirm, setProtocolToConfirm] =
    useState<SsoProtocol | null>(null);
  const protocol = chosenProtocol ?? connection?.protocol ?? 'oidc';

  const handleProtocolChange = (value: string) => {
    const next = value as SsoProtocol;
    if (next === protocol) return;
    // Nothing to lose while no connection exists: swap the form straight away.
    if (!connection?.id) {
      setChosenProtocol(next);
      return;
    }
    setProtocolToConfirm(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('security.idp.title')}</CardTitle>
        <CardDescription>{t('security.idp.description')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <Label>{t('security.idp.protocol')}</Label>
              <RadioGroup
                value={protocol}
                onValueChange={handleProtocolChange}
                className="gap-3"
              >
                {PROTOCOLS.map((option) => (
                  <div key={option.value} className="flex items-start gap-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`sso-protocol-${option.value}`}
                      aria-label={option.label}
                      className="mt-1"
                    />
                    <div className="flex flex-col">
                      <Label
                        htmlFor={`sso-protocol-${option.value}`}
                        className="font-normal"
                      >
                        {option.label}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {t(option.hintKey)}
                      </span>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {protocol === 'oidc' ? (
              <SsoOidcConnectionForm
                organizationId={organizationId}
                connection={connection}
              />
            ) : (
              <SsoSamlConnectionForm
                organizationId={organizationId}
                connection={connection}
              />
            )}
          </>
        )}
      </CardContent>

      {protocolToConfirm && (
        <SwitchSsoProtocolModal
          open
          onOpenChange={(open) => !open && setProtocolToConfirm(null)}
          protocol={protocolToConfirm}
          onConfirm={() => {
            setChosenProtocol(protocolToConfirm);
            setProtocolToConfirm(null);
          }}
        />
      )}
    </Card>
  );
}
