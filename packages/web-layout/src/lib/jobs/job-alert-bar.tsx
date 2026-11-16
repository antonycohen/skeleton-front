import {type ReactNode} from 'react';
import {cn} from '@skeleton/core-utils';
import {Button} from '@skeleton/web-components';
import {LoaderCircle} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JobAlertAction {
  label: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** When false, clicking this action will NOT auto-dismiss the alert bar. Defaults to true. */
  dismissOnClick?: boolean;
}

export interface JobAlertBarOptions {
  message: string;
  icon?: ReactNode;
  actions?: JobAlertAction[];
  dismissible?: boolean;
  variant?: 'info' | 'warning' | 'destructive';
}

// ---------------------------------------------------------------------------
// Variant styles
// ---------------------------------------------------------------------------

// The status tones of web-themes, shared with Alert: info is the `important` tone.
const variantStyles = {
  info: 'bg-important-surface border-important-border text-important-on-surface',
  warning: 'bg-warning-surface border-warning-border text-warning-on-surface',
  destructive: 'bg-destructive-surface border-destructive-border text-destructive-on-surface',
} as const;

// ---------------------------------------------------------------------------
// Alert bar component
// ---------------------------------------------------------------------------

export function JobAlertBar({
  alert,
}: {
  alert: JobAlertBarOptions;
}) {
  const variant = alert.variant ?? 'info';

  return (
    <div
      className={cn(
        'flex w-full items-center gap-1 border-b px-4 py-2.5 animate-in slide-in-from-top-full duration-300',
        variantStyles[variant],
      )}
    >
      <div className="flex flex-1 items-center gap-1">
        <div className="flex size-8 shrink-0 items-center justify-center">
          {alert.icon ?? <LoaderCircle className="size-4 animate-spin" />}
        </div>
        <p className="flex-1 truncate label">
          {alert.message}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {alert.actions?.map((action, idx, arr) => (
          <Button
            key={idx}
            variant={action.variant ?? (idx === arr.length - 1 ? 'default' : 'outline')}
            size={action.size ?? 'sm'}
            onClick={() => {
              action.onClick();
            }}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
