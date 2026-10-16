import {
  CopyButton,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@skeleton/web-components';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@skeleton/core-translations';

type ServiceAccountSecretRevealProps = {
  clientId: string;
  clientSecret: string;
};

export const ServiceAccountSecretReveal = ({
  clientId,
  clientSecret,
}: ServiceAccountSecretRevealProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-start rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
        <div className="pt-0.5">
          <IconAlertTriangle className="size-4 text-destructive" />
        </div>
        <div className="flex flex-col gap-1 flex-1 text-destructive">
          <p className="text-sm font-medium">
            {t('serviceAccounts.secret.shownOnce')}
          </p>
          <p className="text-sm">
            {t('serviceAccounts.secret.copyNow')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('serviceAccounts.clientId')}</span>
        <InputGroup>
          <InputGroupInput
            readOnly
            value={clientId}
            className="font-mono text-xs"
          />
          <InputGroupAddon align="inline-end">
            <CopyButton value={clientId} toastMessage={t('serviceAccounts.clientIdCopied')} />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          {t('serviceAccounts.clientSecret')}
        </span>
        <InputGroup>
          <InputGroupInput
            readOnly
            value={clientSecret}
            className="font-mono text-xs"
          />
          <InputGroupAddon align="inline-end">
            <CopyButton value={clientSecret} toastMessage={t('serviceAccounts.clientSecretCopied')} />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};
