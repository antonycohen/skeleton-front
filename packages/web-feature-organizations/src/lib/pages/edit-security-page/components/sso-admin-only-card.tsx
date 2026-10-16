import {
  Alert,
  AlertDescription,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@skeleton/web-components';
import { SsoWorkspaceStatus } from '@skeleton/core-api-models';
import { InfoIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

type StateCopy = {
  labelKey: string;
  variant: 'secondary' | 'success' | 'important';
  descriptionKey: string;
};

/** The one word and one sentence a member gets per state; nothing about the identity provider. */
export const SSO_STATE_COPY: Record<SsoWorkspaceStatus, StateCopy> = {
  none: {
    labelKey: 'security.sso.memberState.none.label',
    variant: 'secondary',
    descriptionKey: 'security.sso.memberState.none.description',
  },
  draft: {
    labelKey: 'security.sso.memberState.draft.label',
    variant: 'secondary',
    descriptionKey: 'security.sso.memberState.draft.description',
  },
  tested: {
    labelKey: 'security.sso.memberState.tested.label',
    variant: 'secondary',
    descriptionKey: 'security.sso.memberState.tested.description',
  },
  enabled: {
    labelKey: 'security.sso.memberState.enabled.label',
    variant: 'success',
    descriptionKey: 'security.sso.memberState.enabled.description',
  },
  enforced: {
    labelKey: 'security.sso.memberState.enforced.label',
    variant: 'important',
    descriptionKey: 'security.sso.memberState.enforced.description',
  },
};

export type SsoAdminOnlyCardProps = {
  /** `organization.ssoStatus`; `null` while unknown. */
  status: SsoWorkspaceStatus | null;
};

/**
 * What an editor or a viewer sees of single sign-on: where the workspace stands, and nothing
 * else. The API reserves every read of the connection for the workspace's admins (403), so a
 * disabled copy of the cards would only ever be empty; the state comes off the organization.
 */
export function SsoAdminOnlyCard({ status }: SsoAdminOnlyCardProps) {
  const { t } = useTranslation();
  const copy = status ? SSO_STATE_COPY[status] : null;
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">{t('security.sso.title')}</CardTitle>
        <CardDescription>{t('security.sso.adminOnly.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {copy && (
          <div className="flex items-start gap-3">
            <Badge variant={copy.variant} className="mt-0.5 shrink-0">
              {t(copy.labelKey)}
            </Badge>
            <span className="text-sm text-muted-foreground">{t(copy.descriptionKey)}</span>
          </div>
        )}
        <Alert>
          <InfoIcon />
          <AlertDescription>{t('security.adminOnly')}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
