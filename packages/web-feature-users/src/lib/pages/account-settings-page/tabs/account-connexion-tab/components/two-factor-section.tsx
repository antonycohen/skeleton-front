import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MfaEnrolment, MfaRequirement, ReadUser } from '@skeleton/core-api-models';
import { useGetUserMfaStatus, useStartMfaEnrolment } from '@skeleton/core-api';
import { TFunction, useTranslation } from '@skeleton/core-translations';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@skeleton/web-components';
import { IconShieldCheck, IconShieldOff } from '@tabler/icons-react';
import { LockIcon, TriangleAlertIcon } from 'lucide-react';
import { EnableMfaModal } from './mfa/enable-mfa-modal';
import { DisableMfaModal } from './mfa/disable-mfa-modal';
import { RegenerateRecoveryCodesModal } from './mfa/regenerate-recovery-codes-modal';

/** Below this many unused codes we nudge the user to regenerate before they run out. */
const LOW_RECOVERY_CODES = 3;

/** Why the second factor is required (B-260): an administrator account, or the user's workspaces. */
const describeRequirement = (
  t: TFunction,
  requiredBy: MfaRequirement | null | undefined,
): string => {
  const workspaces = (requiredBy?.organizations ?? [])
    .map((organization) => organization.name)
    .filter((name): name is string => !!name);
  if (requiredBy?.superAdmin) {
    return t('account.mfa.requiredForAdmins');
  }
  return workspaces.length > 0
    ? t('account.mfa.requiredBy', { workspaces: workspaces.join(', ') })
    : t('account.mfa.requiredByWorkspace');
};

type TwoFactorSectionProps = {
  user: ReadUser;
};

type OpenDialog = 'enable' | 'disable' | 'regenerate' | null;

export const TwoFactorSection = ({ user }: TwoFactorSectionProps) => {
  const userId = user.id as string;
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [enrolment, setEnrolment] = useState<MfaEnrolment | null>(null);
  const { t } = useTranslation();

  const { data: status, isLoading } = useGetUserMfaStatus({ userId });

  // The secret is returned once, so it is fetched by the button and handed to the dialog.
  const startEnrolment = useStartMfaEnrolment({
    onSuccess: (pending) => {
      setEnrolment(pending);
      setOpenDialog('enable');
    },
    onError: (error) => toast.error(error.error || t('account.mfa.setupStartFailed')),
  });

  const closeDialog = (open: boolean) => {
    if (!open) {
      setOpenDialog(null);
      setEnrolment(null);
    }
  };

  const enabled = status?.enabled ?? user.mfaEnabled ?? false;
  const enabledAt = status?.enabledAt ?? user.mfaEnabledAt ?? null;
  const remaining = status?.recoveryCodesRemaining ?? null;
  // While required the API refuses to disable it (409), so the button is not offered at all.
  const required = status?.required ?? false;
  // `enabled` is known from the user right away, `required` only once the status is: until then
  // neither button acts, or "Disable" would be clickable for someone the API will refuse.
  const isStatusPending = isLoading && !status;

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">{t('account.mfa.title')}</CardTitle>
          <CardDescription>
            {t('account.mfa.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
              {enabled ? (
                <IconShieldCheck className="size-6 shrink-0 text-teal-600" />
              ) : (
                <IconShieldOff className="size-6 shrink-0 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span className="font-semibold">{t('account.mfa.authenticatorApp')}</span>
                <span className="text-sm text-muted-foreground">
                  {enabled
                    ? enabledAt
                      ? t('account.mfa.enabledSince', {
                          date: format(new Date(enabledAt), 'dd MMM yyyy'),
                        })
                      : t('account.mfa.enabled')
                    : t('account.mfa.notEnabled')}
                </span>
              </div>
            </div>
            {enabled ? (
              <Badge variant="success">{t('account.mfa.on')}</Badge>
            ) : (
              <Badge variant="outline">{t('account.mfa.off')}</Badge>
            )}
          </div>

          {enabled && remaining !== null && (
            <div className="flex items-center justify-between gap-4 border-t py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t('account.mfa.recoveryCodes')}</span>
                <span className="text-sm text-muted-foreground">
                  {remaining === 0
                    ? t('account.mfa.recoveryCodesNoneLeft')
                    : t('account.mfa.recoveryCodesRemaining', { count: remaining })}
                </span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpenDialog('regenerate')}>
                {t('account.mfa.regenerate')}
              </Button>
            </div>
          )}

          {enabled && remaining !== null && remaining < LOW_RECOVERY_CODES && (
            <Alert variant={remaining === 0 ? 'destructive' : 'important'}>
              <TriangleAlertIcon />
              <AlertTitle>
                {remaining === 0
                  ? t('account.mfa.noRecoveryCodesLeft')
                  : t('account.mfa.lowRecoveryCodes')}
              </AlertTitle>
              <AlertDescription>
                {t('account.mfa.regenerateNow')}
              </AlertDescription>
            </Alert>
          )}

          {required && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-muted-foreground">
              <LockIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                {describeRequirement(t, status?.requiredBy)}{' '}
                {enabled
                  ? t('account.mfa.cannotBeDisabled')
                  : t('account.mfa.setUpNow')}
              </span>
            </div>
          )}
        </CardContent>
        {/* Required and enabled leaves nothing to offer: "Disable" would only be refused */}
        {!(enabled && required) && (
          <CardFooter className="justify-end gap-2 border-t">
            {enabled ? (
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive"
                disabled={isStatusPending}
                onClick={() => setOpenDialog('disable')}
              >
                {t('account.mfa.disable')}
              </Button>
            ) : (
              <Button
                type="button"
                isLoading={startEnrolment.isPending}
                disabled={isStatusPending}
                onClick={() => startEnrolment.mutate({ userId })}
              >
                {t('account.mfa.setUp')}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {openDialog === 'enable' && enrolment && (
        <EnableMfaModal open onOpenChange={closeDialog} user={user} enrolment={enrolment} />
      )}
      {openDialog === 'disable' && <DisableMfaModal open onOpenChange={closeDialog} user={user} />}
      {openDialog === 'regenerate' && (
        <RegenerateRecoveryCodesModal open onOpenChange={closeDialog} user={user} />
      )}
    </>
  );
};
