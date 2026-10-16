import {FC, JSX, ReactNode} from 'react';
import {VariantPropsButton} from '@skeleton/web-components';
import type {NavbarProps} from '@skeleton/web-layout';

export type FunnelActionButton<T> = {
  id: string;
  onClick?: (context: FunnelContextValue<T>, data: T) => void;
  label: string | ReactNode;
} & VariantPropsButton;

export type FunnelStep<T> = {
  id: string;
  label: string;
  path: string;
  component: FC;
  availabilityFn: (context: FunnelContext<T>) => boolean;
  actions?: FunnelActionButton<T>[]
  /**
   * If true, this step will appear in the stepper navigation.
   * @default true
   */
  showInStepper?: boolean;
  /**
   * If true, the stepper will be visible when this step is active.
   * @default true
   */
  showStepper?: boolean;

  /**
   * Optional component to render in the left section of the top bar for this step.
   * Can be used to display contextual information like the name of the entity being edited.
   */
  optionComponent?: ReactNode;

  /**
   * Extra navbar slots for this step: a fixed-width left group, in-flow
   * content next to it (the studio tabs) and a mobile second row (which
   * replaces the stepper there).
   */
  navbar?: Pick<NavbarProps, 'leftClassName' | 'children' | 'mobileSecondRow'> & {
    /**
     * Hides the funnel top bar for this step; the step renders its own header
     * (the building step: job bar first, then a logo-only bar).
     */
    hidden?: boolean;
  };
};

export type FunnelContext<T> = {
  steps: FunnelStep<T>[];
  state: T;
};

/**
 * Value type for the FunnelContext
 * Contains all data and functions needed for funnel navigation, stepper logic, and context sharing.
 *
 * @template T - The type of the funnel subject
 */
export type FunnelContextValue<T> = {

  /**
   * Whether the stepper should be visible for the current step
   */
  showStepper: boolean;
  /**
   * The active step index among the stepperSteps
   */
  stepperActiveStepIndex: number;

  instantiatedSteps: JSX.Element[];
  /**
   * Array of all funnel steps
   */
  steps: FunnelStep<T>[];
  /**
   * The subject data model for the funnel
   */
  state: T;

  setState?: (state: T) => void;

  /**
   * Base URL for the funnel routes
   */
  baseUrl: string;
  // Navigation state and functions
  /**
   * Array of steps that are currently available based on availability functions
   */
  availableSteps: FunnelStep<T>[];
  /**
   * Processed steps for the stepper UI component with navigation info
   */
  stepperSteps: { label: string; navigateTo: string; isAvailable: boolean }[];
  /**
   * Index of the currently active step
   */
  activeStepIndex: number;

  activeStep: FunnelStep<T>;
  /**
   * Whether the current step is the last available step
   */
  isLastStep: boolean;
  /**
   * Whether the current step is the first available step
   */
  isFirstStep: boolean;
  /**
   * URL to navigate to when going back
   */
  backUrl: string;

  dispatchUrl: string;
  /**
   * Navigate to a specific step by index
   */
  navigateToStep: (stepIndex: number) => void;
  /**
   * Navigate to the next available step
   */
  navigateToNextStep: (replace?: boolean) => void;
  /**
   * Navigate to the previous available step
   */
  navigateToPreviousStep: () => void;

  /**
   * Get the actions for the currently active step
   */
  getActiveStepActions: () => FunnelActionButton<T>[];
};

export interface FunnelNavigationHookOptions<T> {
  context: FunnelContext<T>;
  baseUrl: string;
  currentPath: string;
}
