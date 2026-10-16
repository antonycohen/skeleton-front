import {memo, ReactNode} from 'react';
import {cn} from '@skeleton/core-utils';
import {FunnelTopBar} from './funnel-top-bar';

export interface FunnelLayoutProps {
  /**
   * Children to render in the content area
   */
  children?: ReactNode;
  /**
   * Additional class name for the content container
   */
  contentClassName?: string;
  /**
   * Additional class name for the top bar container
   */
  topBarClassName?: string;
  /**
   * Custom component to render in the left section of the top bar
   */
  leftComponent?: ReactNode;
}

/**
 * FunnelLayout component for rendering a complete funnel layout
 * Includes top bar with stepper and actions, plus content area
 * Uses the FunnelProvider context via useFunnel hook
 */
export const FunnelLayout = memo(
  ({
    children,
    contentClassName,
    topBarClassName,
    leftComponent,
  }: FunnelLayoutProps) => {

    return (
      <div className="flex h-viewport w-full flex-col">
        <FunnelTopBar
          className={topBarClassName}
          leftComponent={leftComponent}
        />
        {/* min-h-0 lets both flex levels shrink to the viewport so full-height
            steps (the studio, the edit chat) scroll internally; steps taller
            than the viewport still overflow visibly and scroll the page. */}
        <div
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className={cn('min-h-0', contentClassName)}>{children}</div>
        </div>
      </div>
    );
  }
);

FunnelLayout.displayName = 'FunnelLayout';
