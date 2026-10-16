import { Alert, AlertDescription, AlertTitle, Button } from '@skeleton/web-components';
import { CheckIcon, CopyIcon, DownloadIcon, TriangleAlertIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TFunction, useTranslation } from '@skeleton/core-translations';

type RecoveryCodesListProps = {
  codes: string[];
  /** Used to name the downloaded file. */
  accountEmail?: string | null;
};

const asText = (t: TFunction, codes: string[], accountEmail?: string | null) =>
  [
    accountEmail
      ? t('account.mfa.recoveryFile.titleFor', { email: accountEmail })
      : t('account.mfa.recoveryFile.title'),
    t('account.mfa.recoveryFile.instructions'),
    '',
    ...codes,
    '',
  ].join('\n');

/**
 * The single-use recovery codes, shown exactly once after activation or regeneration.
 * Offers copy and download because the user has to store them outside the application now.
 */
export const RecoveryCodesList = ({ codes, accountEmail }: RecoveryCodesListProps) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      toast.success(t('account.mfa.recoveryCodesList.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('account.mfa.recoveryCodesList.copyFailed'));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([asText(t, codes, accountEmail)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-codes.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="important">
        <TriangleAlertIcon />
        <AlertTitle>{t('account.mfa.recoveryCodesList.saveNowTitle')}</AlertTitle>
        <AlertDescription>
          {t('account.mfa.recoveryCodesList.saveNowDescription')}
        </AlertDescription>
      </Alert>

      <ul
        aria-label={t('account.mfa.recoveryCodes')}
        className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border bg-muted/40 px-5 py-4 font-mono text-sm select-all"
      >
        {codes.map((code) => (
          <li key={code} className="tracking-wider">
            {code}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          {t('account.mfa.recoveryCodesList.copy')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
          <DownloadIcon className="size-4" />
          {t('account.mfa.recoveryCodesList.download')}
        </Button>
      </div>
    </div>
  );
};
