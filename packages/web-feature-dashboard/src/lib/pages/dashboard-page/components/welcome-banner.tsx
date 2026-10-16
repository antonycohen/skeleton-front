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
    <div className="relative flex items-center overflow-hidden rounded-2xl border bg-primary p-10 lg:p-16">
      <div className="relative z-10 flex max-w-md flex-col gap-6">
        <h2
          className="font-heading text-4xl font-semibold leading-tight tracking-tight text-primary-foreground">
          {firstName ? t('dashboard.welcome.titleWithName', {firstName}) : t('dashboard.welcome.title')}
        </h2>
        <p className="text-base text-primary-foreground/80">
          {t('dashboard.welcome.description')}
        </p>
        <Button variant="outline" className="w-fit bg-white px-3" asChild>
          <Link to={`${workspaceBaseUrl}/assistant`} className={'flex items-center justify-center gap-2'}>
            <SparklesIcon className="size-4"/>
            {t('dashboard.welcome.openAssistant')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
