import {SparklesIcon} from 'lucide-react';
import {Button} from '@skeleton/web-components';
import {Link} from 'react-router-dom';
import {useTranslation} from '@skeleton/core-translations';

interface WelcomeBannerProps {
  firstName?: string | null;
  workspaceBaseUrl: string;
}

export function WelcomeBanner({firstName, workspaceBaseUrl}: WelcomeBannerProps) {
  const {t} = useTranslation();
  return (
    <div className="relative flex items-center overflow-hidden rounded-2xl bg-primary p-8 outline outline-1 outline-offset-[-1px] outline-border-subtle">
      <div className="relative z-10 flex max-w-md flex-col gap-6">
        <h2 className="heading-md text-primary-foreground">
          {firstName ? t('dashboard.welcome.titleWithName', {firstName}) : t('dashboard.welcome.title')}
        </h2>
        <p className="body-lg text-primary-foreground/80">{t('dashboard.welcome.description')}</p>
        <Button className="w-fit px-3" asChild>
          <Link to={`${workspaceBaseUrl}/assistant`} className="flex items-center justify-center gap-2">
            <SparklesIcon className="size-4" />
            {t('dashboard.welcome.openAssistant')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
