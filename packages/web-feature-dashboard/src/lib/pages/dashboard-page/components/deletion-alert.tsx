import {TriangleAlertIcon} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle, Button} from '@skeleton/web-components';
import {useTranslation} from '@skeleton/core-translations';

interface DeletionAlertProps {
  deleteAt: string;
  isPending: boolean;
  onCancelDeletion: () => void;
}

export function DeletionAlert({deleteAt, isPending, onCancelDeletion}: DeletionAlertProps) {
  const {t} = useTranslation();
  return (
    <Alert variant="destructive"
           className="flex items-center gap-3 rounded-2xl border-rose-100 bg-rose-50 p-4 [&>svg]:translate-y-0">
      <TriangleAlertIcon className="size-4 shrink-0"/>
      <div className="flex flex-1 flex-col gap-2">
        <AlertTitle className="truncate text-sm">
          {t('dashboard.deletionAlert.title')}
        </AlertTitle>
        <AlertDescription className="text-destructive">
          {t('dashboard.deletionAlert.description', {
            date: new Date(deleteAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          })}
        </AlertDescription>
      </div>
      <Button
        size="sm"
        className="h-6 shrink-0 text-xs"
        disabled={isPending}
        onClick={onCancelDeletion}
      >
        {t('dashboard.deletionAlert.cancel')}
      </Button>
    </Alert>
  );
}
