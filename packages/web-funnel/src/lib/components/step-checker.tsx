import { memo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useFunnel } from '../store/funnel-provider';
import { FunnelStep } from '../types';

interface StepCheckerProps {
  /**
   * The step to check availability for
   */
  step: FunnelStep<unknown>;
  /**
   * The URL to redirect to if the step is not available
   * @default "dispatch"
   */
  redirectTo?: string;
}

/**
 * StepChecker component for checking if a step is available
 * Redirect to the dispatch route if the step is not available
 * Uses the FunnelProvider context via useFunnel hook
 */
export const StepChecker = memo<StepCheckerProps>(
  ({ step }: StepCheckerProps) => {
    // Get steps and subject from the FunnelProvider
    const { steps, state, dispatchUrl } = useFunnel();

    // Check if the step is available
    if (!step.availabilityFn({ steps, state })) {
      return <Navigate to={dispatchUrl} />;
    }

    return <Outlet />;
  },
);
