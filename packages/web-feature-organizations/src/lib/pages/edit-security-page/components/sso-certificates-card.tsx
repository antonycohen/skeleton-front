import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyButton,
  Skeleton,
} from '@skeleton/web-components';
import {
  createSsoCertificateSchema,
  ReadSsoCertificate,
  ReadSsoConnection,
  SSO_CERTIFICATE_MAX_LENGTH,
} from '@skeleton/core-api-models';
import {
  useAddSsoCertificate,
  useDeleteSsoCertificate,
  useImportSsoConnectionMetadata,
} from '@skeleton/core-api';
import { format } from 'date-fns';
import { RefreshCcwIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { certificateExpiryState } from '../certificate-expiry';
import { toPemCertificate } from '../certificate-file';
import { useSsoCertificateList } from '../hooks/use-sso-certificate-list';
import { RemoveSsoCertificateModal } from '../modals/remove-sso-certificate-modal';
import { FileOrPasteInput } from './file-or-paste-input';
import { useTranslation } from '@skeleton/core-translations';

/** The API registers two at most: the room a rotation needs, and no more. */
const MAX_CERTIFICATES = 2;

export type SsoCertificatesCardProps = {
  organizationId: string;
  connection: ReadSsoConnection;
};

const formatDate = (value: string | null | undefined) =>
  value ? format(new Date(value), 'dd/MM/yyyy') : '—';

/** Enough of a fingerprint to tell two certificates apart in a dialog or a label. */
const shortFingerprint = (fingerprint: string | null | undefined) => {
  if (!fingerprint) return '—';

  return fingerprint.length > 16 ? `${fingerprint.slice(0, 16)}…` : fingerprint;
};

function ExpiryBadge({ certificate }: { certificate: ReadSsoCertificate }) {
  const { t } = useTranslation();
  const state = certificateExpiryState(certificate, new Date());

  if (state.kind === 'expired') {
    return <Badge variant="destructive">{t('security.certificates.expired')}</Badge>;
  }
  if (state.kind === 'not_yet_valid') {
    return <Badge variant="warning">{t('security.certificates.notYetValid')}</Badge>;
  }
  if (state.kind === 'expiring') {
    return (
      <Badge variant="warning">
        {t('security.certificates.expiresIn', { days: state.daysLeft })}
      </Badge>
    );
  }
  if (state.kind === 'valid') {
    return <Badge variant="success">{t('security.certificates.valid')}</Badge>;
  }

  return null;
}

/**
 * The signing certificates of a SAML connection. Two at most, which is the whole point: register the
 * provider's new one, let it switch, then remove the old one — nobody is signed out in between.
 */
export function SsoCertificatesCard({
  organizationId,
  connection,
}: SsoCertificatesCardProps) {
  const { t, tIfKey } = useTranslation();
  const [pem, setPem] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [certificateToRemove, setCertificateToRemove] =
    useState<ReadSsoCertificate | null>(null);

  const { data: certificates, isLoading } = useSsoCertificateList(
    organizationId,
    true,
  );

  const addCertificate = useAddSsoCertificate({
    onSuccess: () => {
      setPem('');
      toast.success(t('security.certificates.registered'));
    },
  });

  const deleteCertificate = useDeleteSsoCertificate({
    onSuccess: () => {
      setCertificateToRemove(null);
      toast.success(t('security.certificates.removed'));
    },
    onError: (error) => toast.error(error.error),
  });

  const importMetadata = useImportSsoConnectionMetadata({
    onSuccess: () =>
      toast.success(t('security.certificates.metadataApplied')),
    // 422 (5511) when the document cannot be used, 409 without a metadata URL: its message says which.
    onError: (error) => toast.error(error.error),
  });

  const rows = certificates?.data ?? [];
  const validCount = rows.filter((row) => row.status === 'valid').length;
  const isFull = rows.length >= MAX_CERTIFICATES;
  // Non-null while the provider's metadata announces certificates the connection does not hold. Only
  // a connection described by a metadata address can be brought up to date in one click.
  const announcesOtherCertificates =
    !!connection.idpMetadataChangedAt && !!connection.idpMetadataUrl;

  const handleAdd = () => {
    const parsed = createSsoCertificateSchema.safeParse({ pem: pem.trim() });
    if (!parsed.success) {
      setValidationError(
        tIfKey(parsed.error.issues[0]?.message) ??
          t('security.certificates.invalid'),
      );
      return;
    }
    setValidationError(null);
    addCertificate.mutate({ organizationId, data: parsed.data });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {t('security.certificates.title')}
        </CardTitle>
        <CardDescription>
          {t('security.certificates.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {announcesOtherCertificates && (
          <Alert variant="important">
            <TriangleAlertIcon />
            <AlertDescription>
              <span className="flex flex-col items-start gap-3">
                <span>
                  {t('security.certificates.metadataChanged', {
                    date: formatDate(connection.idpMetadataChangedAt),
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => importMetadata.mutate({ organizationId })}
                  isLoading={importMetadata.isPending}
                >
                  <RefreshCcwIcon className="size-4" />
                  {t('security.certificates.applyMetadata')}
                </Button>
              </span>
            </AlertDescription>
          </Alert>
        )}

        {isLoading && <Skeleton className="h-24 w-full rounded-xl" />}

        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('security.certificates.empty')}
          </p>
        )}

        {!isLoading &&
          rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-2xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {row.subject ?? t('security.certificates.fallbackName')}
                    </span>
                    <ExpiryBadge certificate={row} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {t('security.certificates.validity', {
                      from: formatDate(row.notBefore),
                      to: formatDate(row.notAfter),
                    })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCertificateToRemove(row)}
                  aria-label={t('security.certificates.removeLabel', {
                    fingerprint: shortFingerprint(row.fingerprintSha256),
                  })}
                >
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>SHA-256</span>
                <span className="break-all font-mono">
                  {row.fingerprintSha256}
                </span>
                {row.fingerprintSha256 && (
                  <CopyButton value={row.fingerprintSha256} />
                )}
              </div>
            </div>
          ))}

        {!isFull && (
          <div className="flex flex-col gap-3 border-t pt-6">
            <FileOrPasteInput
              id="sso-saml-new-certificate"
              label={
                rows.length === 0
                  ? t('security.certificates.registerFirst')
                  : t('security.certificates.registerSecond')
              }
              accept=".pem,.cer,.crt,application/x-x509-ca-cert,application/pkix-cert"
              placeholder="-----BEGIN CERTIFICATE-----"
              description={t('security.certificates.inputHint')}
              value={pem}
              onChange={setPem}
              maxLength={SSO_CERTIFICATE_MAX_LENGTH}
              readBytes={toPemCertificate}
              error={
                validationError ?? addCertificate.error?.error ?? undefined
              }
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAdd}
                disabled={!pem.trim()}
                isLoading={addCertificate.isPending}
              >
                {t('security.certificates.add')}
              </Button>
            </div>
          </div>
        )}

        {isFull && (
          <p className="border-t pt-6 text-sm text-muted-foreground">
            {t('security.certificates.full')}
          </p>
        )}
      </CardContent>

      {certificateToRemove && (
        <RemoveSsoCertificateModal
          open
          onOpenChange={(open) => !open && setCertificateToRemove(null)}
          label={
            certificateToRemove.subject ??
            shortFingerprint(certificateToRemove.fingerprintSha256)
          }
          isLastValid={
            certificateToRemove.status === 'valid' && validCount === 1
          }
          isRemoving={deleteCertificate.isPending}
          onConfirm={() =>
            certificateToRemove.id &&
            deleteCertificate.mutate({
              organizationId,
              certificateId: certificateToRemove.id,
            })
          }
        />
      )}
    </Card>
  );
}
