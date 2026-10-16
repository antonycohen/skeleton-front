'use client';

import {Fragment, memo, ReactNode} from 'react';
import {cn} from '@skeleton/core-utils';
import {Navbar} from '@skeleton/web-layout';
import {useFunnel} from '../store/funnel-provider';
import {FunnelButton} from './funnel-button';
import {FunnelStepper} from './funnel-stepper';

export interface FunnelTopBarProps {
  /**
   * Additional class name for the top bar container
   */
  className?: string;
  /**
   * Custom component to render in the left section (overrides step's optionComponent)
   */
  leftComponent?: ReactNode;
}

/**
 * The funnel flavour of the app {@link Navbar}:
 * - Left: sidebar toggle, then the step's optionComponent (e.g. the entity name)
 * - Center: the stepper (a full-width second row on mobile)
 * - Right: the step's action buttons
 */
export const FunnelTopBar = memo(({className, leftComponent}: FunnelTopBarProps) => {
  const context = useFunnel<unknown>();
  const { stepperSteps, showStepper, activeStep, getActiveStepActions, state } = context;

  const actions = getActiveStepActions();
  const hasStepper = showStepper && stepperSteps.length > 0;
  const stepNavbar = activeStep?.navbar;

  if (stepNavbar?.hidden) return null;

  return (
    <Navbar
      className={cn('sticky top-0 z-30', className)}
      left={leftComponent ?? activeStep?.optionComponent}
      leftClassName={stepNavbar?.leftClassName}
      center={hasStepper ? <FunnelStepper /> : undefined}
      mobileSecondRow={
        stepNavbar?.mobileSecondRow ?? (hasStepper ? <FunnelStepper compact /> : undefined)
      }
      right={
        actions.length > 0
          ? actions.map((action) =>
              typeof action.label === 'string' ? (
                <FunnelButton
                  key={action.id}
                  variant={action.variant}
                  className="h-9 px-4 text-sm font-medium"
                  onClick={() => {
                    action.onClick?.(context, state);
                  }}
                >
                  {action.label || ''}
                </FunnelButton>
              ) : (
                <Fragment key={action.id}>{action.label}</Fragment>
              ),
            )
          : undefined
      }
    >
      {stepNavbar?.children}
    </Navbar>
  );
});

FunnelTopBar.displayName = 'FunnelTopBar';
