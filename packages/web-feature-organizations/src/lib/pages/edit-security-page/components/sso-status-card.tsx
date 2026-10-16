import { ReactNode } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Skeleton,
  Switch,
} from '@skeleton/web-components';
import { ReadSsoConnection, SsoConnectionStatus } from '@skeleton/core-api-models';
import { IconCircleCheckFilled, IconCircleDashed } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';

/** How far the connection has come, in the order the admin walks it. */
const STEP_ORDER: SsoConnectionStatus[] = [
  'draft',
  'tested',
  'enabled',
  'enforced',
];

/**
 * The state's own name, as the notices of the identity provider card and the help center use it
 * ("sends the connection back to draft"). Members see the softer wording of SSO_STATE_COPY instead.
 */
const STATUS_BADGE: Record<
  SsoConnectionStatus,
  { labelKey: string; variant: 'secondary' | 'success' | 'important' }
> = {
  draft: { labelKey: 'security.sso.status.draft', variant: 'secondary' },
  tested: { labelKey: 'security.sso.status.tested', variant: 'secondary' },
  enabled: { labelKey: 'security.sso.status.enabled', variant: 'success' },
  enforced: { labelKey: 'security.sso.status.enforced', variant: 'important' },
};

const isReached = (
  status: SsoConnectionStatus | null,
  step: SsoConnectionStatus,
) => !!status && STEP_ORDER.indexOf(status) >= STEP_ORDER.indexOf(step);

export type SsoStatusCardProps = {
  connection: ReadSsoConnection | undefined;
  isLoading: boolean;
  hasVerifiedDomain: boolean;
  isTesting: boolean;
  isUpdatingEnablement: boolean;
  onTest: () => void;
  onEnable: () => void;
  onDisable: () => void;
  /** Opens the confirmation dialog; `true` requires single sign-on, `false` lifts the requirement. */
  onEnforcementChange: (enforced: boolean) => void;
};

type StepProps = {
  title: string;
  description: string;
  done: boolean;
  action?: ReactNode;
};

const Step = ({ title, description, done, action }: StepProps) => (
  <div className="flex items-start justify-between gap-4 border-t py-4 first:border-t-0 first:pt-0">
    <div className="flex items-start gap-3">
      {done ? (
        <IconCircleCheckFilled className="mt-0.5 size-5 shrink-0 text-teal-600" />
      ) : (
        <IconCircleDashed className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      )}
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);

/**
 * The four states of the connection, each with the one action that leaves it: describe the provider,
 * test the sign-in, enable it, require it. The API refuses out-of-order moves, so what is not this
 * step's action is not offered.
 */
export function SsoStatusCard({
  connection,
  isLoading,
  hasVerifiedDomain,
  isTesting,
  isUpdatingEnablement,
  onTest,
  onEnable,
  onDisable,
  onEnforcementChange,
}: SsoStatusCardProps) {
  const { t } = useTranslation();
  const status = connection?.status ?? null;
  const isConfigured = !!connection?.id;
  const isEnforced = status === 'enforced';
  const lastTestedBy = connection?.lastTestedBy?.email;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl">{t('security.sso.status.title')}</CardTitle>
          {!isLoading && status && (
            <Badge variant={STATUS_BADGE[status].variant}>
              {t(STATUS_BADGE[status].labelKey)}
            </Badge>
          )}
        </div>
        <CardDescription>{t('security.sso.status.description')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col">
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <>
            <Step
              title={t('security.sso.steps.described.title')}
              description={
                !isConfigured
                  ? t('security.sso.steps.described.empty')
                  : status === 'draft'
                    ? t('security.sso.steps.described.draft')
                    : t('security.sso.steps.described.saved')
              }
              done={isConfigured}
            />
            <Step
              title={t('security.sso.steps.tested.title')}
              description={
                connection?.lastTestedAt
                  ? lastTestedBy
                    ? t('security.sso.steps.tested.lastTestBy', {
                        date: format(new Date(connection.lastTestedAt), 'dd/MM/yyyy'),
                        email: lastTestedBy,
                      })
                    : t('security.sso.steps.tested.lastTest', {
                        date: format(new Date(connection.lastTestedAt), 'dd/MM/yyyy'),
                      })
                  : t('security.sso.steps.tested.description')
              }
              done={isReached(status, 'tested')}
              action={
                (status === 'draft' || status === 'tested') && (
                  <Button
                    variant={status === 'draft' ? 'default' : 'outline'}
                    onClick={onTest}
                    isLoading={isTesting}
                  >
                    {t('security.sso.steps.tested.action')}
                  </Button>
                )
              }
            />
            <Step
              title={t('security.sso.steps.enabled.title')}
              description={
                hasVerifiedDomain
                  ? t('security.sso.steps.enabled.description')
                  : t('security.sso.steps.enabled.noDomain')
              }
              done={isReached(status, 'enabled')}
              action={
                status === 'tested' ? (
                  <Button
                    onClick={onEnable}
                    disabled={!hasVerifiedDomain}
                    isLoading={isUpdatingEnablement}
                  >
                    {t('security.sso.steps.enabled.enable')}
                  </Button>
                ) : (
                  status === 'enabled' && (
                    <Button
                      variant="outline"
                      onClick={onDisable}
                      isLoading={isUpdatingEnablement}
                    >
                      {t('security.sso.steps.enabled.disable')}
                    </Button>
                  )
                )
              }
            />
            <Step
              title={t('security.sso.steps.enforced.title')}
              description={
                isEnforced
                  ? connection?.enforcedAt
                    ? t('security.sso.steps.enforced.since', {
                        date: format(new Date(connection.enforcedAt), 'dd/MM/yyyy'),
                      })
                    : t('security.sso.steps.enforced.sinceSwitchedOn')
                  : t('security.sso.steps.enforced.description')
              }
              done={isEnforced}
              action={
                <>
                  <Label htmlFor="sso-required" className="sr-only">
                    {t('security.ssoModal.enforceLabel')}
                  </Label>
                  <Switch
                    id="sso-required"
                    checked={isEnforced}
                    disabled={status !== 'enabled' && !isEnforced}
                    onCheckedChange={onEnforcementChange}
                  />
                </>
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
