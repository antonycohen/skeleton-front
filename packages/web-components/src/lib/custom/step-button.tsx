import {cn} from '@skeleton/core-utils';
import {Check} from 'lucide-react';
import {Link} from "react-router-dom";

export type StepButtonState = 'filled' | 'active' | 'disabled';
export type StepButtonSize = 'default' | 'sm' | 'sm-mobile';

export type StepButtonProps = {
  label: string;
  number: number;
  to?: string;
  state?: StepButtonState;
  size?: StepButtonSize;
  className?: string;
};

export function StepButton({
  label,
  number,
  state = 'filled',
  className,
  to,
}: StepButtonProps) {
  const isFilled = state === 'filled';
  const isActive = state === 'active';
  const isDisabled = state === 'disabled';

  const rootClassName = cn(
    'flex relative',
    'flex-1 min-w-0 flex-col items-center gap-1',
    '@3xl:flex-none @3xl:flex-row @3xl:gap-2',
    to && 'cursor-pointer disabled:cursor-not-allowed',
    className
  );

  const content = (
    <>
      {/* Circle with number or check */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full size-5',
          isFilled && 'bg-indigo-100',
          isActive && 'bg-primary',
          isDisabled && 'bg-muted'
        )}
      >
        {isFilled ? (
          <Check
            className={cn('size-3 text-primary')}
            strokeWidth={2.5}
          />
        ) : (
          <span
            className={cn(
              'text-center font-semibold text-xs leading-4',
              isActive && 'text-primary-foreground',
              isDisabled && 'text-muted-foreground'
            )}
          >
            {number}
          </span>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          'font-medium',
          'text-xs truncate w-full text-center',
          '@3xl:w-auto @3xl:overflow-visible @3xl:text-left',
          (isFilled || isActive) && 'text-foreground',
          isDisabled && 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </>
  );

  if (!isDisabled && to) {
    return (
      <Link
        to={to}
        type="button"
        data-slot="step-button"
        className={rootClassName}
      >
        {content}
      </Link>
    );
  }

  return (
    <div data-slot="step-button" className={rootClassName}>
      {content}
    </div>
  );
}
