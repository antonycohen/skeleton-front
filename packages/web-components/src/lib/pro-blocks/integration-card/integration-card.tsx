import * as React from 'react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { ExternalLink, Settings, Hand } from 'lucide-react';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';

type IntegrationCardStatus = 'not-connected' | 'connected' | 'expiring' | 'expired';

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  active?: boolean;
  status?: IntegrationCardStatus;
  externalUrl?: string;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  onSettingsClick?: () => void;
  onRequestClick?: () => void;
  className?: string;
}

function StatusBadge({ status }: { status: IntegrationCardStatus }) {
  const { t } = useTranslation();
  if (status === 'not-connected') return null;

  const dotColor =
    status === 'connected'
      ? 'bg-emerald-400'
      : status === 'expiring'
        ? 'bg-amber-400'
        : 'bg-rose-500';
  const label =
    status === 'connected'
      ? t('components.integration.connected')
      : status === 'expiring'
        ? t('components.integration.expiring')
        : t('components.integration.expired');

  return (
    <div className="flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5">
      <span className={cn('size-2 rounded-full', dotColor)} />
      <span className="text-xs font-medium text-secondary-foreground">
        {label}
      </span>
    </div>
  );
}

function IntegrationCard({
  title,
  description,
  icon,
  active = true,
  status = 'not-connected',
  externalUrl,
  enabled = false,
  onEnabledChange,
  onSettingsClick,
  onRequestClick,
  className,
}: IntegrationCardProps) {
  const { t } = useTranslation();
  const showStatusBadge = active && status !== 'not-connected';

  return (
    <div
      className={cn(
        'flex w-full max-w-[369px] flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm',
        status === 'expired' && 'border-destructive/20',
        className
      )}
    >
      {/* Card Content */}
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex grow items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden">
              {icon}
            </div>
            {showStatusBadge && <StatusBadge status={status} />}
          </div>
          {externalUrl && (
            <Button variant="ghost" size="icon" asChild>
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
          <p className="line-clamp-2 h-10 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex h-16 items-center justify-between border-t px-6 py-4">
        {active ? (
          <>
            {onSettingsClick && (
              <Button variant="outline" size="sm" onClick={onSettingsClick}>
                <Settings className="size-4" />
                {t('components.integration.settings')}
              </Button>
            )}
            <Switch className="ml-auto" checked={enabled} onCheckedChange={onEnabledChange} />
          </>
        ) : (
          <>
            {onRequestClick && (
              <Button variant="secondary" size="sm" onClick={onRequestClick}>
                <Hand className="size-4" />
                {t('components.integration.request')}
              </Button>
            )}
            <Badge className="ml-auto">{t('components.integration.comingSoon')}</Badge>
          </>
        )}
      </div>
    </div>
  );
}

export { IntegrationCard, type IntegrationCardProps, type IntegrationCardStatus };
