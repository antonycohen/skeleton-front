import { Button, ButtonProps } from '@skeleton/web-components';
import { cn } from '@skeleton/core-utils';

export interface FunnelButtonProps extends ButtonProps {
  /**
   * Whether the button is in loading state
   * @default false
   */
  isLoading?: boolean;
}

/**
 * A standardized button component for funnel navigation
 */
export function FunnelButton({
  className,
  children,
  isLoading,
  ...rest
}: FunnelButtonProps) {
  return (
    <Button className={cn('w-full sm:w-auto', className)} {...rest}>
      {children} {isLoading && '...'}
    </Button>
  );
}
