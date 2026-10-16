import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export type AlertCardStatus = 'error' | 'warning' | 'success';

export type AlertCardProps = {
  className?: string;
  title: string;
  value: string;
  status: AlertCardStatus;
  statusLabel: string;
  actionLabel?: string;
  onAction?: () => void;
};

const statusDotColors: Record<AlertCardStatus, string> = {
  error: 'bg-rose-500',
  warning: 'bg-amber-400',
  success: 'bg-emerald-400',
};

export function AlertCard({
  className,
  title,
  value,
  status,
  statusLabel,
  actionLabel,
  onAction,
}: AlertCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      data-slot="alert-card"
      className={cn('gap-2 p-6', className)}
    >
      <span className="text-sm font-medium text-card-foreground">{title}</span>
      <span className="text-2xl font-bold text-card-foreground">{value}</span>
      <Badge variant="secondary" className="w-fit rounded-md">
        <span className={cn('size-2 rounded-full', statusDotColors[status])} />
        {statusLabel}
      </Badge>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel ?? t('components.alertCard.manage')}
        </Button>
      </div>
    </Card>
  );
}
