import { useUpdateOrganizationSsoAvailability } from '@skeleton/core-api';
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
import { useTranslation } from '@skeleton/core-translations';

// Withdrawing is not just hiding the settings: every sign-in goes through `SsoConnectionGate`,
// which asks for the entitlement first, so the identity provider stops answering the moment it is
// gone — never leaving people with a requirement nobody can meet.

type OrganizationSsoAvailabilityModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  /** The state being confirmed: `true` makes single sign-on available, `false` withdraws it. */
  available: boolean;
};

/**
 * Confirms the Enterprise single sign-on entitlement of a workspace. Back office only: the
 * permission is held through the super-admin alias, and the entitlement is what turns the
 * workspace's Security page from an upsell into settings.
 */
export const OrganizationSsoAvailabilityModal = ({
  open,
  onOpenChange,
  organizationId,
  available,
}: OrganizationSsoAvailabilityModalProps) => {
  const { t } = useTranslation();
  const updateAvailability = useUpdateOrganizationSsoAvailability({
    onSuccess: () => {
      toast.success(
        available
          ? t('adminOrganizations.sso.availability.grantedToast')
          : t('adminOrganizations.sso.availability.withdrawnToast'),
      );
      onOpenChange(false);
    },
  });

  const handleConfirm = () => {
    updateAvailability.mutate({ organizationId, available });
  };

  // The API is the gate, and its refusals are actionable: 403 for anyone but a super admin, 409
  // while the workspace's connection is enforced ("lift the requirement first"). The dialog stays
  // open with that message, since the operator's next move is named in it.
  const refusal = updateAvailability.error?.error ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {available
              ? t('adminOrganizations.sso.availability.grantTitle')
              : t('adminOrganizations.sso.availability.withdrawTitle')}
          </DialogTitle>
          <DialogDescription>
            {available
              ? t('adminOrganizations.sso.availability.grantDescription')
              : t('adminOrganizations.sso.availability.withdrawDescription')}
          </DialogDescription>
        </DialogHeader>

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
            variant={available ? 'default' : 'destructive'}
            onClick={handleConfirm}
            isLoading={updateAvailability.isPending}
          >
            {available
              ? t('adminOrganizations.sso.availability.grantAction')
              : t('adminOrganizations.sso.availability.withdrawAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
