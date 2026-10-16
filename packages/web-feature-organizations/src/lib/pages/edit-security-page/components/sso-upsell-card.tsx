import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@skeleton/web-components';
import { useOpenPaywall } from '@skeleton/web-feature-payment';
import { IconKey } from '@tabler/icons-react';
import { useTranslation } from '@skeleton/core-translations';

/**
 * What a workspace that is not entitled to single sign-on sees. It fetches no SSO setting at all:
 * every one of those calls would answer 404, and there is nothing to show anyway.
 */
export function SsoUpsellCard() {
  const { t } = useTranslation();
  const { openPaywall } = useOpenPaywall();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl">{t('security.sso.title')}</CardTitle>
          <Badge variant="important">{t('security.sso.upsell.badge')}</Badge>
        </div>
        <CardDescription>{t('security.sso.upsell.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <IconKey className="mt-0.5 size-5 shrink-0" />
          <span>{t('security.sso.upsell.features')}</span>
        </div>
        <div>
          <Button type="button" onClick={() => openPaywall('sso')}>
            {t('security.sso.upsell.cta')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
