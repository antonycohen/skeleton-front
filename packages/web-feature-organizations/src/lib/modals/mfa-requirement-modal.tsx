import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { useUpdateOrganizationMfaRequirement } from '@skeleton/core-api';
import { toast } from 'sonner';
import { TFunction, useTranslation } from '@skeleton/core-translations';

type MfaRequirementModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  /** The state being confirmed: `true` requires two-factor authentication, `false` lifts it. */
  required: boolean;
  /**
   * Accepted members without two-factor authentication. Only a workspace admin or a back-office
   * super admin can count them (the API hides `mfaEnabled` from everyone else): leave it out otherwise.
   */
  membersWithoutMfaCount?: number | null;
  /** The member list was longer than what was counted. */
  membersCountIsPartial?: boolean;
};

function describeRequire(t: TFunction, count: number | null | undefined, isPartial: boolean) {
  if (count == null) {
    return t('security.mfaModal.requireUnknown');
  }
  if (count === 0 && !isPartial) {
    return t('security.mfaModal.requireAllCovered');
  }
  return isPartial
    ? t('security.mfaModal.requireCountAtLeast', { count })
    : t('security.mfaModal.requireCount', { count });
}

/**
 * Confirms switching the workspace's two-factor authentication requirement. Surface-agnostic (no
 * workspace hooks): used by the workspace security page and the back-office profile tab.
 */
export const MfaRequirementModal = ({
  open,
  onOpenChange,
  organizationId,
  required,
  membersWithoutMfaCount,
  membersCountIsPartial = false,
}: MfaRequirementModalProps) => {
  const { t } = useTranslation();
  const updateRequirement = useUpdateOrganizationMfaRequirement({
    onSuccess: () => {
      toast.success(
        required ? t('security.mfaModal.requireSuccess') : t('security.mfaModal.liftSuccess'),
      );
      onOpenChange(false);
    },
    // The API is the gate: 403 for anyone but a workspace admin, 409 when the caller requiring it
    // has no second factor of their own. Its message says which, a retry would not help.
    onError: (error) => {
      toast.error(error.message || t('security.mfaModal.error'));
      onOpenChange(false);
    },
  });

  const handleConfirm = () => {
    updateRequirement.mutate({ organizationId, required });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {required ? t('security.mfaModal.requireTitle') : t('security.mfaModal.liftTitle')}
          </DialogTitle>
          <DialogDescription>
            {required
              ? describeRequire(t, membersWithoutMfaCount, membersCountIsPartial)
              : t('security.mfaModal.liftDescription')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant={required ? 'default' : 'destructive'}
            onClick={handleConfirm}
            isLoading={updateRequirement.isPending}
          >
            {required ? t('security.mfaModal.requireConfirm') : t('security.mfaModal.liftConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
