import {
  Alert,
  AlertDescription,
  AlertTitle,
  CopyButton,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@skeleton/web-components';
import { TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

type ServiceAccountSecretRevealProps = {
  clientId: string;
  clientSecret: string;
};

type SecretFieldProps = {
  label: string;
  value: string;
  toastMessage: string;
};

/** A read-only value with its copy button. */
const SecretField = ({ label, value, toastMessage }: SecretFieldProps) => (
  <div className="flex flex-col gap-2">
    <span className="label">{label}</span>
    <InputGroup>
      <InputGroupInput readOnly value={value} className="code" />
      <InputGroupAddon align="inline-end">
        <CopyButton value={value} toastMessage={toastMessage} />
      </InputGroupAddon>
    </InputGroup>
  </div>
);

export const ServiceAccountSecretReveal = ({
  clientId,
  clientSecret,
}: ServiceAccountSecretRevealProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      {/* An instruction to act on now, not an error: the warning tone, not the destructive red. */}
      <Alert variant="warning">
        <TriangleAlertIcon />
        <AlertTitle>{t('serviceAccounts.secret.shownOnce')}</AlertTitle>
        <AlertDescription>{t('serviceAccounts.secret.copyNow')}</AlertDescription>
      </Alert>

      <SecretField
        label={t('serviceAccounts.clientId')}
        value={clientId}
        toastMessage={t('serviceAccounts.clientIdCopied')}
      />
      <SecretField
        label={t('serviceAccounts.clientSecret')}
        value={clientSecret}
        toastMessage={t('serviceAccounts.clientSecretCopied')}
      />
    </div>
  );
};
