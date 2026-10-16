import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyButton,
  Input,
  Skeleton,
} from '@skeleton/web-components';
import {
  createSsoDomainSchema,
  ReadSsoDomain,
  SsoDomainStatus,
} from '@skeleton/core-api-models';
import {
  useCreateSsoDomain,
  useDeleteSsoDomain,
  useVerifySsoDomain,
} from '@skeleton/core-api';
import { GlobeIcon, RefreshCcwIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { RemoveSsoDomainModal } from '../modals/remove-sso-domain-modal';

const statusVariants: Record<
  SsoDomainStatus,
  'success' | 'warning' | 'destructive'
> = {
  verified: 'success',
  pending: 'warning',
  suspended: 'destructive',
};

const statusLabelKeys: Record<SsoDomainStatus, string> = {
  verified: 'security.domains.status.verified',
  pending: 'security.domains.status.pending',
  suspended: 'security.domains.status.suspended',
};

export type SsoVerifiedDomainsCardProps = {
  organizationId: string;
  domains: ReadSsoDomain[];
  isLoading: boolean;
  /** The connection lets people in today: removing the last verified domain stops that. */
  isConnectionActive: boolean;
};

/**
 * The e-mail domains this workspace claims, each proven by a DNS TXT record. A domain is added and
 * verified, never edited, so there is one input and one action per row.
 */
export function SsoVerifiedDomainsCard({
  organizationId,
  domains,
  isLoading,
  isConnectionActive,
}: SsoVerifiedDomainsCardProps) {
  const { t, tIfKey } = useTranslation();
  const [domain, setDomain] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  // The API's refusal belongs to the row it was asked about: which record is missing, or that the
  // DNS did not answer at all, is what tells the admin what to do next.
  const [verifyError, setVerifyError] = useState<{
    domainId: string;
    message: string;
  } | null>(null);
  const [domainToRemove, setDomainToRemove] = useState<ReadSsoDomain | null>(
    null,
  );

  const createDomain = useCreateSsoDomain({
    onSuccess: () => {
      setDomain('');
      toast.success(t('security.domains.added'));
    },
  });

  const verifyDomain = useVerifySsoDomain({
    onSuccess: (verified) => {
      setVerifyError(null);
      toast.success(t('security.domains.verified', { domain: verified.domain }));
    },
  });

  const deleteDomain = useDeleteSsoDomain({
    onSuccess: () => {
      setDomainToRemove(null);
      toast.success(t('security.domains.removed'));
    },
    onError: (error) => toast.error(error.error),
  });

  const handleAdd = () => {
    const parsed = createSsoDomainSchema.safeParse({
      domain: domain.trim().toLowerCase(),
    });
    if (!parsed.success) {
      setValidationError(tIfKey(parsed.error.issues[0]?.message) ?? t('security.domains.invalid'));
      return;
    }
    setValidationError(null);
    createDomain.mutate({ organizationId, data: parsed.data });
  };

  const handleVerify = (toVerify: ReadSsoDomain) => {
    if (!toVerify.id) return;
    const domainId = toVerify.id;
    setVerifyError(null);
    verifyDomain.mutate(
      { organizationId, domainId },
      {
        onError: (error) => setVerifyError({ domainId, message: error.error }),
      },
    );
  };

  const verifiedCount = domains.filter(
    (row) => row.status === 'verified',
  ).length;
  const addError = validationError ?? createDomain.error?.error ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('security.domains.title')}</CardTitle>
        <CardDescription>{t('security.domains.description')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <div className="relative">
              <GlobeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleAdd()}
                placeholder="acme.com"
                aria-label={t('security.domains.inputLabel')}
                className="pl-9"
              />
            </div>
            {addError && (
              <p className="text-sm text-destructive">{addError}</p>
            )}
          </div>
          <Button
            onClick={handleAdd}
            disabled={!domain.trim()}
            isLoading={createDomain.isPending}
          >
            {t('security.domains.add')}
          </Button>
        </div>

        {isLoading && <Skeleton className="h-24 w-full rounded-xl" />}

        {!isLoading && domains.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('security.domains.empty')}
          </p>
        )}

        {!isLoading &&
          domains.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-2xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{row.domain}</span>
                  {row.status && (
                    <Badge variant={statusVariants[row.status]}>
                      {t(statusLabelKeys[row.status])}
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.status !== 'verified' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(row)}
                      isLoading={
                        verifyDomain.isPending &&
                        verifyDomain.variables?.domainId === row.id
                      }
                    >
                      <RefreshCcwIcon className="size-4" />
                      {t('security.domains.verify')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDomainToRemove(row)}
                    aria-label={t('security.domains.removeLabel', { domain: row.domain })}
                  >
                    <Trash2Icon className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {row.status === 'verified' ? (
                <p className="text-sm text-muted-foreground">
                  {t('security.domains.keepRecord')}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    {row.status === 'suspended'
                      ? t('security.domains.recordMissing')
                      : t('security.domains.publishRecord')}
                  </p>
                  <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-muted-foreground">
                        {t('security.domains.record.type')}
                      </span>
                      <span className="font-mono">
                        {row.verificationRecordType ?? 'TXT'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-muted-foreground">
                        {t('security.domains.record.name')}
                      </span>
                      <span className="break-all font-mono">
                        {row.verificationRecordName}
                      </span>
                      {row.verificationRecordName && (
                        <CopyButton value={row.verificationRecordName} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-muted-foreground">
                        {t('security.domains.record.value')}
                      </span>
                      <span className="break-all font-mono">
                        {row.verificationRecordValue}
                      </span>
                      {row.verificationRecordValue && (
                        <CopyButton value={row.verificationRecordValue} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {verifyError?.domainId === row.id && (
                <p className="text-sm text-destructive">
                  {verifyError.message}
                </p>
              )}
            </div>
          ))}
      </CardContent>

      {domainToRemove && (
        <RemoveSsoDomainModal
          open
          onOpenChange={(open) => !open && setDomainToRemove(null)}
          domain={domainToRemove.domain ?? ''}
          // The connection falls back to "tested" — nobody signs in through it any more.
          isLastVerifiedOfActiveConnection={
            isConnectionActive &&
            domainToRemove.status === 'verified' &&
            verifiedCount === 1
          }
          isRemoving={deleteDomain.isPending}
          onConfirm={() =>
            domainToRemove.id &&
            deleteDomain.mutate({ organizationId, domainId: domainToRemove.id })
          }
        />
      )}
    </Card>
  );
}
