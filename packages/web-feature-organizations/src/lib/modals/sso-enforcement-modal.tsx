import { useUpdateSsoConnectionEnforcement } from '@skeleton/core-api';
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { TFunction, useTranslation } from '@skeleton/core-translations';

type SsoEnforcementModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  /** The state being confirmed: `true` requires single sign-on, `false` lifts the requirement. */
  enforced: boolean;
  /**
   * Active members whose address is on a verified domain — the people the identity provider takes
   * over. `null` when the viewer cannot count them (see `countMembersOnVerifiedDomains`).
   */
  membersOnVerifiedDomainsCount?: number | null;
  /** The member list was longer than what was counted. */
  membersCountIsPartial?: boolean;
  /**
   * Who is confirming. The back office acts on a workspace it is not a member of, so the wording
   * speaks of "this workspace" rather than "yours" and recalls the identity check support owes the
   * requester. Only the lifting wording differs: staff can never require single sign-on (403).
   */
  surface?: 'workspace' | 'back-office';
};

function describeEnforce(
  t: TFunction,
  count: number | null | undefined,
  isPartial: boolean,
) {
  if (count == null) {
    return t('security.ssoModal.enforceUnknown');
  }
  return isPartial
    ? t('security.ssoModal.enforceCountAtLeast', { count })
    : t('security.ssoModal.enforceCount', { count });
}

function describeLift(
  t: TFunction,
  surface: 'workspace' | 'back-office',
  count: number | null | undefined,
  isPartial: boolean,
) {
  if (surface === 'workspace') {
    return t('security.ssoModal.liftWorkspace');
  }
  if (count == null) {
    return t('security.ssoModal.liftBackOfficeUnknown');
  }
  return isPartial
    ? t('security.ssoModal.liftBackOfficeCountAtLeast', { count })
    : t('security.ssoModal.liftBackOfficeCount', { count });
}

/**
 * Confirms requiring single sign-on for the workspace's verified domains, or lifting the
 * requirement. Surface-agnostic (no workspace hooks): used by the workspace security page and by
 * the back office, where support can lift a requirement that locks a workspace out.
 */
export const SsoEnforcementModal = ({
  open,
  onOpenChange,
  organizationId,
  enforced,
  membersOnVerifiedDomainsCount,
  membersCountIsPartial = false,
  surface = 'workspace',
}: SsoEnforcementModalProps) => {
  const { t } = useTranslation();
  const updateEnforcement = useUpdateSsoConnectionEnforcement({
    onSuccess: () => {
      toast.success(
        enforced
          ? t('security.ssoModal.enforceSuccess')
          : t('security.ssoModal.liftSuccess'),
      );
      onOpenChange(false);
    },
  });

  const handleConfirm = () => {
    updateEnforcement.mutate({ organizationId, enforced });
  };

  // The API is the gate, and its refusals are actionable: 409 (5508) asks the admin to sign in
  // through the identity provider first, 409 (5506) that the connection be enabled. The dialog
  // stays open with that message instead of closing on a toast the admin reads too late.
  const refusal = updateEnforcement.error?.error ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {enforced
              ? t('security.ssoModal.enforceTitle')
              : t('security.ssoModal.liftTitle')}
          </DialogTitle>
          <DialogDescription>
            {enforced
              ? describeEnforce(
                  t,
                  membersOnVerifiedDomainsCount,
                  membersCountIsPartial,
                )
              : describeLift(
                  t,
                  surface,
                  membersOnVerifiedDomainsCount,
                  membersCountIsPartial,
                )}
          </DialogDescription>
        </DialogHeader>

        {enforced && (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>{t('security.ssoModal.enforceWarning')}</span>
            <span>{t('security.ssoModal.enforceUnaffected')}</span>
          </div>
        )}

        {/* Lifting for a customer is a support act, not a setting: the workspace is handed back to
            passwords on someone's word, so the operator is reminded whose word it has to be. */}
        {!enforced && surface === 'back-office' && (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>{t('security.ssoModal.backOfficeWarning')}</span>
            <span>{t('security.ssoModal.backOfficeRecorded')}</span>
          </div>
        )}

        {refusal && (
          <Alert variant="important">
            <TriangleAlertIcon />
            <AlertDescription>{refusal}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant={enforced ? 'default' : 'destructive'}
            onClick={handleConfirm}
            isLoading={updateEnforcement.isPending}
          >
            {enforced
              ? t('security.ssoModal.enforceConfirm')
              : t('security.ssoModal.liftConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
