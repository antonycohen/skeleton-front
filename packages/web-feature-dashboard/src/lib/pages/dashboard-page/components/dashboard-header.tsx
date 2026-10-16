import {useTranslation} from '@skeleton/core-translations';

export function DashboardHeader() {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {t('dashboard.title')}
      </h1>
    </div>
  );
}
