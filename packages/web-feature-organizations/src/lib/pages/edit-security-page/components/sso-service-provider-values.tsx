import {
  Alert,
  AlertDescription,
  Button,
  CopyButton,
  Label,
} from '@skeleton/web-components';
import { ReadSsoConnection } from '@skeleton/core-api-models';
import {
  usePatchSsoConnection,
  useSaveSsoConnection,
} from '@skeleton/core-api';
import { format } from 'date-fns';
import { ExternalLinkIcon, InfoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

export type SsoServiceProviderValuesProps = {
  organizationId: string;
  /** The workspace's connection, whatever its protocol; `undefined` while it has none. */
  connection: ReadSsoConnection | undefined;
};

type ValueRowProps = {
  label: string;
  value: string | null | undefined;
};

const ValueRow = ({ label, value }: ValueRowProps) => (
  <div className="flex flex-col gap-1.5">
    <Label>{label}</Label>
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
      <span className="break-all font-mono text-xs">{value}</span>
      {value && <CopyButton value={value} />}
    </div>
  </div>
);

/** A file the browser saves from memory: the PEM is short, no request needed. */
const pemDataUrl = (pem: string) =>
  `data:application/x-pem-file;charset=utf-8,${encodeURIComponent(pem)}`;

/**
 * The values an admin registers on the identity provider's side, and the platform's signing
 * certificate for a provider that wants it pasted. They carry the connection's id, so the API only
 * has them once the connection exists: before that, one click saves a draft with the protocol alone
 * (the API accepts it) and the values appear, for the providers that ask for them first (Entra).
 */
export function SsoServiceProviderValues({
  organizationId,
  connection,
}: SsoServiceProviderValuesProps) {
  const { t } = useTranslation();
  const onError = (error: { error: string }) => toast.error(error.error);
  const saveConnection = useSaveSsoConnection({ onError });
  const patchConnection = usePatchSsoConnection({ onError });
  const isIssuing = saveConnection.isPending || patchConnection.isPending;

  const issueValues = () => {
    const data = { protocol: 'saml' as const };
    // A connection on the other protocol is switched rather than replaced, so the settings the form
    // does not show (role, session length, just-in-time creation) keep their value.
    if (connection?.id) {
      patchConnection.mutate({ organizationId, data });
      return;
    }
    saveConnection.mutate({ organizationId, data });
  };

  const isSamlConnection =
    connection?.protocol === 'saml' && !!connection.spEntityId;

  if (!isSamlConnection) {
    return (
      <Alert>
        <InfoIcon />
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>{t('security.sp.issueNotice')}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={issueValues}
            isLoading={isIssuing}
          >
            {t('security.sp.issue')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{t('security.sp.title')}</span>
        <span className="text-sm text-muted-foreground">
          {t('security.sp.description')}
        </span>
      </div>

      <ValueRow
        label={t('security.sp.entityId')}
        value={connection.spEntityId}
      />
      <ValueRow label={t('security.sp.acsUrl')} value={connection.spAcsUrl} />

      {connection.spMetadataUrl && (
        <div className="flex flex-col gap-1.5">
          <Label>{t('security.sp.metadata')}</Label>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <span className="break-all font-mono text-xs">
              {connection.spMetadataUrl}
            </span>
            <CopyButton value={connection.spMetadataUrl} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={connection.spMetadataUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLinkIcon className="size-4" />
                {t('security.sp.open')}
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              {/* A public document: the browser downloads it straight from the API. */}
              <a
                href={connection.spMetadataUrl}
                download="sp-metadata.xml"
              >
                {t('security.sp.download')}
              </a>
            </Button>
          </div>
        </div>
      )}

      {connection.spCertificate && (
        <div className="flex flex-col gap-1.5">
          <Label>{t('security.sp.certificate')}</Label>
          <span className="text-sm text-muted-foreground">
            {connection.spCertificateNotAfter
              ? t('security.sp.certificateHintUntil', {
                  date: format(connection.spCertificateNotAfter, 'dd/MM/yyyy'),
                })
              : t('security.sp.certificateHint')}
          </span>
          <div className="flex items-center gap-2">
            <CopyButton value={connection.spCertificate} />
            <Button variant="outline" size="sm" asChild>
              <a
                href={pemDataUrl(connection.spCertificate)}
                download="sp-certificate.pem"
              >
                {t('security.sp.download')}
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
