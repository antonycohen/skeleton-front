import {createContext, ReactNode, useCallback, useContext, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import {FunnelContextValue, FunnelStep} from '../types';

/**
 * Props for the FunnelProvider component
 * @template T - The type of the funnel subject
 */
type FunnelProviderProps<T> = {
  /**
   * React children to be wrapped by the provider
   */
  children: ReactNode;
  /**
   * Array of funnel steps that define the navigation flow
   */
  steps: FunnelStep<T>[];
  /**
   * The subject data model for the funnel
   */
  state: T;

  setState?: (state: T) => void;
  /**
   * Base URL for the funnel routes (e.g., "/my-funnel")
   */
  baseUrl?: string;
  /**
   * Optional label displayed as a goal pill after all stepper steps
   */
  goalLabel?: string | null;
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FunnelContextVal = createContext<FunnelContextValue<any> | null>(null);


/**
 * FunnelProvider component
 *
 * Provides context for funnel navigation, state management, stepper logic, and step availability.
 * Handles logic for stepper visibility (showStepper), inclusion (showInStepper), and correct stepper indexing.
 * This is the core component of the funnel system that manages the navigation state
 * and provides functions for navigating between steps and steps display in the stepper.
 *
 * @template T - The type of the funnel subject
 * @example
 * ```tsx
 * <FunnelProvider steps={steps} subject={subject} baseUrl="/my-funnel">
 *   <FunnelLayout>
 *     <FunnelRoutes />
 *   </FunnelLayout>
 * </FunnelProvider>
 * ```
 */
export function FunnelProvider<T>({
  children,
  steps,
  state,
  setState,
  baseUrl = "",
  goalLabel,
}: FunnelProviderProps<T>) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const instantiatedSteps = steps.map((step, index) => {
    const Step = step.component;

    return <Step key={step.id} />;
  });

  /**
   * Compute the steps to be shown in the stepper. Only steps with showInStepper !== false are included.
   * This allows for pre-steps or special steps to be skipped in the stepper navigation UI.
   */
  const stepperSteps = useMemo(() => {
    return steps
      .filter((step) => step.showInStepper !== false)
      .map((step) => ({
        label: step.label,
        navigateTo: `${baseUrl}/${step.path}`,
        isAvailable: step.availabilityFn({ steps, state }),
        id: step.id,
      }));
  }, [baseUrl, steps, state]);

  const availableSteps = useMemo(() => {
    return steps.filter((step) => step.availabilityFn({ steps, state }));
  }, [steps, state]);

  // Find current step index
  const activeStepIndex = useMemo(() => {
    // Extract the path segment after baseUrl
    const pathSegment = currentPath
      .replace(baseUrl, "")
      .split("/")
      .filter(Boolean)[0];

    // Find the step with an exact path match
    const currentStepIndex = steps.findIndex(
      (step) => step.path === pathSegment,
    );

    return currentStepIndex >= 0 ? currentStepIndex : 0;
  }, [currentPath, baseUrl, steps]);

  /**
   * Determine if the stepper should be visible for the current step.
   * Uses the showStepper property of the active step, defaulting to true.
   */
  const showStepper = useMemo(() => {
    const currentStep = steps[activeStepIndex];

    return currentStep?.showStepper !== false;
  }, [steps, activeStepIndex]);

  /**
   * Compute the index of the current step among the stepperSteps array.
   * This ensures the stepper highlights the correct logical step even if there are pre-steps.
   */
  const stepperActiveStepIndex = useMemo(() => {
    const currentStep = steps[activeStepIndex];

    return stepperSteps.findIndex((step) => step.id === currentStep?.id);
  }, [steps, activeStepIndex, stepperSteps]);

  // Determine if this is the last step
  const isLastStep = useMemo(() => {
    return activeStepIndex === steps.length - 1;
  }, [activeStepIndex, steps.length]);

  // Determine if this is the first step
  const isFirstStep = useMemo(() => {
    return activeStepIndex === 0;
  }, [activeStepIndex]);

  // Calculate back URL
  const backUrl = useMemo(() => {
    if (activeStepIndex <= 0) {
      return baseUrl;
    }

    const previousStep = steps[activeStepIndex - 1];

    return previousStep ? `${baseUrl}/${previousStep.path}` : baseUrl;
  }, [activeStepIndex, steps, baseUrl]);

  // Navigation functions
  const navigateToStep = useCallback(
    (stepIndex: number, replace?: boolean) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        const targetStep = steps[stepIndex];
        navigate(`${baseUrl}/${targetStep.path}`, { replace: replace ?? false });
      }
    },
    [steps, baseUrl, navigate],
  );

  const navigateToNextStep = useCallback((replace?: boolean) => {
    if (activeStepIndex < steps.length - 1) {
      navigateToStep(activeStepIndex + 1, replace);
    }
  }, [activeStepIndex, steps.length, navigateToStep]);

  const navigateToPreviousStep = useCallback((replace?: boolean) => {
    if (activeStepIndex > 0) {
      navigateToStep(activeStepIndex - 1, replace);
    }
  }, [activeStepIndex, navigateToStep]);

  const getActiveStepActions = useCallback(() => {
    return steps[activeStepIndex].actions ?? [];
  }, [activeStepIndex, steps]);


  const contextValue = useMemo<FunnelContextValue<T>>(() => {
    return {
      // Context data
      steps,
      state,
      baseUrl,
      dispatchUrl: `${baseUrl}/dispatch`,
      setState,

      // Navigation state and functions
      activeStep: steps[activeStepIndex],
      availableSteps,
      stepperSteps,
      activeStepIndex,
      isLastStep,
      isFirstStep,
      backUrl,
      navigateToStep,
      navigateToNextStep,
      navigateToPreviousStep,
      getActiveStepActions,
      instantiatedSteps,

      // Stepper visibility and active index
      showStepper,
      stepperActiveStepIndex,
      goalLabel,
    };
  }, [
    steps,
    state,
    setState,
    baseUrl,
    goalLabel,
    availableSteps,
    stepperSteps,
    activeStepIndex,
    isLastStep,
    isFirstStep,
    backUrl,
    navigateToStep,
    navigateToNextStep,
    navigateToPreviousStep,
    getActiveStepActions,
    instantiatedSteps,
    showStepper,
    stepperActiveStepIndex,
  ]);

  return (
      <FunnelContextVal.Provider value={contextValue}>
        {children}
      </FunnelContextVal.Provider>
  );
}

export function useFunnel<T>() {
  const context = useContext(FunnelContextVal);

  if (context === null) {
    throw new Error("useFunnel must be used within a <FunnelProvider />");
  }

  return context as FunnelContextValue<T>;
}
