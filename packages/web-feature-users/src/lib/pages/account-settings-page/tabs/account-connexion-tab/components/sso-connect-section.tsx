import {Card, CardContent, CardDescription, CardHeader, CardTitle, SsoConnector} from "@skeleton/web-components";
import {InfoIcon} from "lucide-react";
import {ReadUser} from "@skeleton/core-api-models";
import {useTranslation} from "@skeleton/core-translations";
import {GoogleLogo, LinkedInLogo, MicrosoftLogo} from "../../../../shared";

export const SsoConnectSection = ({user}: {user: ReadUser}) => {
  const {t} = useTranslation();

  // Get connected identifiers from user's socialIdentifiers
  const socialIdentifiers = user?.socialIdentifiers ?? {};
  const googleEmail = socialIdentifiers['google'] ?? null;
  const linkedInId = socialIdentifiers['linkedin'] ?? null;
  const microsoftId = socialIdentifiers['microsoft'] ?? null;

  const handleConnect = (provider: string) => {
    // TODO: Implement OAuth connection flow
    console.log(`Connect to ${provider}`);
  };

  const handleDisconnect = (provider: string) => {
    // TODO: Implement disconnect flow
    console.log(`Disconnect from ${provider}`);
  };

  return <div className="flex gap-8 hidden">
    {/* Main content */}
    <Card className="flex-1 rounded-2xl basis-1/2">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">{t('account.sso.title')}</CardTitle>
        <CardDescription>
          {t('account.sso.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-6">
        <SsoConnector
          logo={<GoogleLogo />}
          providerName="Google"
          isConnected={!!googleEmail}
          identifier={googleEmail ?? undefined}
          onConnect={() => handleConnect('google')}
          onDisconnect={() => handleDisconnect('google')}
        />
        <SsoConnector
          logo={<LinkedInLogo />}
          providerName="LinkedIn"
          isConnected={!!linkedInId}
          identifier={linkedInId ?? undefined}
          onConnect={() => handleConnect('linkedin')}
          onDisconnect={() => handleDisconnect('linkedin')}
        />
        <SsoConnector
          logo={<MicrosoftLogo />}
          providerName="Microsoft"
          isConnected={!!microsoftId}
          identifier={microsoftId ?? undefined}
          onConnect={() => handleConnect('microsoft')}
          onDisconnect={() => handleDisconnect('microsoft')}
        />
      </CardContent>
    </Card>

    {/* Info sidebar */}
    <div className="w-80 shrink-0 basis-1/2">
      <div className="self-stretch px-4 py-3 bg-card rounded-[10px] border inline-flex justify-start items-center gap-3">
        <InfoIcon className="size-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t('account.sso.info')}
        </p>
      </div>
    </div>
  </div>
}
