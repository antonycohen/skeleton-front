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

const variantStyles = {
  info: 'bg-indigo-50 border-indigo-100 text-indigo-600',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  destructive: 'bg-red-50 border-red-100 text-red-600',
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
        <p className="flex-1 truncate text-sm font-medium leading-5">
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
