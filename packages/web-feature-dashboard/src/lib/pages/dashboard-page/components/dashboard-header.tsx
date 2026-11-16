import {useTranslation} from '@skeleton/core-translations';

export function DashboardHeader() {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1>{t('dashboard.title')}</h1>
    </div>
  );
}
