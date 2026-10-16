import { Navigate } from "react-router-dom";
import { useFunnel } from '../store/funnel-provider';


/**
 * Default FunnelDispatcher component that intelligently routes users to the appropriate step
 * This component implements common routing logic that can be overridden by providing a custom dispatcher
 * Uses the FunnelProvider context via useFunnel hook
 */
export function DefaultFunnelDispatcher() {
  // Get steps and context from the FunnelProvider
  const { steps, state, baseUrl } = useFunnel();

  // If there are no steps, redirect to the root
  if (steps.length === 0) {
    return <Navigate to={baseUrl} replace />;
  }

  // Find the first available step
  const firstAvailableStep = steps.find((step) =>
    step.availabilityFn({ steps, state }),
  );

  // If no steps are available, redirect to the first step anyway (fallback)
  const targetStep = firstAvailableStep || steps[0];

  // Construct the path
  const targetPath = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/${targetStep.path}`
    : targetStep.path;

  return <Navigate to={targetPath} replace />;
}
