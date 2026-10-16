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
import { SsoProtocol } from '@skeleton/core-api-models';
import { TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

export type SwitchSsoProtocolModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The protocol being switched to. */
  protocol: SsoProtocol;
  onConfirm: () => void;
};

const PROTOCOL_LABELS: Record<SsoProtocol, string> = {
  oidc: 'OpenID Connect',
  saml: 'SAML 2.0',
};

/**
 * Asked before an existing connection changes protocol, because the API treats it as a change of
 * trust material and it costs more than a form reset: the connection returns to draft, so single
 * sign-on stops and the requirement is lifted; the settings of the protocol being left go with it
 * (the client secret for OIDC, the registered certificates for SAML); and everyone bound to the
 * connection binds again at their next sign-in, another entity ID being another directory.
 */
export const SwitchSsoProtocolModal = ({
  open,
  onOpenChange,
  protocol,
  onConfirm,
}: SwitchSsoProtocolModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('security.switchProtocol.title', { protocol: PROTOCOL_LABELS[protocol] })}
          </DialogTitle>
          <DialogDescription>
            {t('security.switchProtocol.description', {
              protocol: PROTOCOL_LABELS[protocol],
            })}
          </DialogDescription>
        </DialogHeader>

        <Alert variant="important">
          <TriangleAlertIcon />
          <AlertDescription>
            <span className="flex flex-col gap-1">
              <span>
                {t('security.switchProtocol.draftWarning')}
              </span>
              <span>
                {protocol === 'saml'
                  ? t('security.switchProtocol.secretDropped')
                  : t('security.switchProtocol.certificatesRemoved')}{' '}
                {t('security.switchProtocol.rebind')}
              </span>
            </span>
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {t('security.switchProtocol.confirm', { protocol: PROTOCOL_LABELS[protocol] })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
