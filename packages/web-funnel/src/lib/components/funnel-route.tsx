import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';


import { DefaultFunnelDispatcher } from './default-funnel-dispatcher';
import { StepChecker } from './step-checker';
import { useFunnel } from '../store/funnel-provider';

/**
 * Props for the FunnelRoutes component
 */
export interface FunnelRoutesProps {
  /**
   * Custom dispatcher component (optional)
   * If not provided, DefaultFunnelDispatcher will be used
   * The dispatcher is responsible for determining which step to navigate to initially
   */
  dispatcher?: ReactElement;
  /**
   * Base URL for the funnel (optional)
   * Used by the default dispatcher to construct proper paths
   * If not provided, will use the baseUrl from the FunnelProvider
   * Example: "/my-funnel" will create routes like "/my-funnel/step-1"
   */
  baseUrl?: string;
}

/**
 * FunnelRoutes component that handles route configuration for funnels
 *
 * This component extracts routing logic from individual funnel implementations,
 * making it reusable across the application. It automatically creates:
 *
 * 1. A dispatcher route for initial funnel entry
 * 2. Step routes with availability checks
 * 3. A default redirect route
 *
 * The component uses the FunnelProvider context to access steps and navigation state,
 * eliminating the need to pass these as props.
 *
 * @example
 * ```tsx
 * <FunnelProvider steps={steps} subject={subject} baseUrl="/my-funnel">
 *   <FunnelLayout>
 *     <FunnelRoutes />
 *   </FunnelLayout>
 * </FunnelProvider>
 * ```
 */
export function FunnelRoutes({
  dispatcher
}: FunnelRoutesProps) {
  // Get steps and context from the FunnelProvider
  const { steps, baseUrl, instantiatedSteps } = useFunnel();

  // Use the provided dispatcher or the default one
  const dispatcherElement = dispatcher || (
    <DefaultFunnelDispatcher />
  );

  return (
    <Routes>
      {/* Dispatcher route */}
      <Route path="dispatch" element={dispatcherElement} />

      {/* Step routes with availability check */}
      {steps.map((step, i) => {
        return (
          <Route
            key={step.id}
            path={step.path}
            element={<StepChecker step={step} />}
          >
            <Route index element={instantiatedSteps[i]} />
          </Route>
        );
      })}

      <Route path="*" element={<Navigate to={`${baseUrl}/dispatch`} replace />} />
    </Routes>
  );
}
