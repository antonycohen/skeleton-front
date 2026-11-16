import {CircleAlertIcon} from 'lucide-react';
import {Alert, AlertAction, AlertDescription, AlertTitle, Button} from '@skeleton/web-components';
import {useTranslation} from '@skeleton/core-translations';

interface DeletionAlertProps {
  deleteAt: string;
  isPending: boolean;
  onCancelDeletion: () => void;
}

export function DeletionAlert({deleteAt, isPending, onCancelDeletion}: DeletionAlertProps) {
  const {t} = useTranslation();
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{t('dashboard.deletionAlert.title')}</AlertTitle>
      <AlertDescription>
        {t('dashboard.deletionAlert.description', {
          date: new Date(deleteAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        })}
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm" disabled={isPending} onClick={onCancelDeletion}>
          {t('dashboard.deletionAlert.cancel')}
        </Button>
      </AlertAction>
    </Alert>
  );
}
