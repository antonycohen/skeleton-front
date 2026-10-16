import {ReactNode} from 'react';
import {cn} from '@skeleton/core-utils';
import {useTranslation} from '@skeleton/core-translations';
import {Badge} from "../ui/badge";
import {Button} from "../ui/button";

export type SsoConnectorProps = {
  logo: ReactNode;
  providerName: string;
  isConnected: boolean;
  identifier?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  className?: string;
};

export function SsoConnector({
  logo,
  providerName,
  isConnected,
  identifier,
  onConnect,
  onDisconnect,
  className,
}: SsoConnectorProps) {
  const {t} = useTranslation();

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border bg-card p-6',
        className
      )}
    >
      {/* Logo */}
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {logo}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">
            {providerName}
          </span>
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 px-2 py-0.5 text-xs',
              isConnected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-muted bg-muted/50 text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'size-2 rounded-full',
                isConnected ? 'bg-emerald-400' : 'bg-muted-foreground/50'
              )}
            />
            {isConnected ? t('components.sso.connected') : t('components.sso.notConnected')}
          </Badge>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {isConnected && identifier ? identifier : t('components.sso.notConnected')}
        </p>
      </div>

      {/* Action button */}
      <div className="shrink-0">
        {isConnected ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            className="text-xs"
          >
            {t('components.sso.disconnect')}
          </Button>
        ) : (
          <Button variant="default" size="sm" onClick={onConnect}>
            {t('components.sso.connect')}
          </Button>
        )}
      </div>
    </div>
  );
}
