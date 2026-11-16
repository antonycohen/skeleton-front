import * as React from 'react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Card, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export type MetricCardVariant = 'default' | 'empty';

export type MetricCardProps = {
  className?: string;
  variant?: MetricCardVariant;
  headerText?: string;
  icon?: React.ReactNode;
  statisticText?: string;
  descriptionText?: string;
  descriptionDataEmpty?: string;
  badge1?: boolean;
  badge1Text?: string;
  badge2?: boolean;
  badge2Text?: string;
  slot?: React.ReactNode;
  separator?: boolean;
  cta1?: boolean;
  cta1Text?: string;
  onCtaClick?: () => void;
};

export function MetricCard({
  className,
  variant = 'default',
  headerText,
  icon,
  statisticText = '$5,329',
  descriptionText = '',
  descriptionDataEmpty,
  badge1 = false,
  badge1Text = 'Save 50€',
  badge2 = false,
  badge2Text = 'Save 50€',
  slot,
  separator: showSeparator = false,
  cta1 = false,
  cta1Text = 'Button',
  onCtaClick,
}: MetricCardProps) {
  const { t } = useTranslation();
  const isEmpty = variant === 'empty';

  return (
    <Card
      data-slot="metric-card"
      className={cn(
        'gap-4 overflow-hidden p-6',
        className
      )}
    >
      {/* Header + Icon row */}
      <div className="flex w-full items-start gap-2 ">
        <div className="flex flex-1 flex-col gap-4">
          {/* Header */}
          <CardTitle>{headerText ?? t('components.metricCard.thisMonth')}</CardTitle>

          {/* Data */}
          <div className="flex w-full flex-col gap-1">
            <span
              className={cn(
                'heading-md',
                isEmpty ? 'text-ring' : 'text-foreground'
              )}
            >
              {isEmpty ? '0' : statisticText}
            </span>
            {/* No line when there is nothing to say: the value then sits 16px from what follows, as from its title. */}
            {(isEmpty ? (descriptionDataEmpty ?? t('components.metricCard.noData')) : descriptionText) && (
              <span className="body text-muted-foreground">
                {isEmpty ? (descriptionDataEmpty ?? t('components.metricCard.noData')) : descriptionText}
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        {icon && (
          <div className="flex size-14 shrink-0 items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      {/* Badge 1 */}
      {badge1 && (
        <Badge variant="secondary" className="w-fit">
          <span className="size-2 rounded-full bg-emerald-400" />
          {badge1Text}
        </Badge>
      )}

      {/* Badge 2 */}
      {badge2 && (
        <Badge variant="secondary" className="w-fit">
          <span className="size-2 rounded-full bg-emerald-400" />
          {badge2Text}
        </Badge>
      )}

      {/* CTA */}
      {cta1 && (
        <div className="flex w-full flex-col items-end">
          <Button size="sm" onClick={onCtaClick}>
            {cta1Text}
          </Button>
        </div>
      )}

      {/* Separator */}
      {showSeparator && (
        <div className="w-full p-1">
          <Separator />
        </div>
      )}

      {/* Slot */}
      {slot && (
        <div className="flex w-full items-center justify-center overflow-hidden">
          {slot}
        </div>
      )}
    </Card>
  );
}
