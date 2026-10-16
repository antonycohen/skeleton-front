'use client';

import {memo, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {cn} from '@skeleton/core-utils';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@skeleton/web-components';
import {Check} from 'lucide-react';
import {useFunnel} from '../store/funnel-provider';

export interface FunnelStepperProps {
  className?: string;
  /**
   * Force the stacked (indicator above label) layout. Otherwise it switches on
   * automatically when the navbar's left and right groups leave less room than
   * the stepper's natural width.
   */
  compact?: boolean;
}

// Room kept between the stepper and the navbar's side groups (16px each side).
const SIDE_GUTTER = 32;

/**
 * The funnel's step navigation for the navbar's center slot: 20px indicators,
 * 24px dividers, labels muted until reached. Steps navigate when available.
 */
export const FunnelStepper = memo(({className, compact: forcedCompact = false}: FunnelStepperProps) => {
  const navigate = useNavigate();
  const { stepperSteps: steps, stepperActiveStepIndex } = useFunnel<unknown>();
  const [autoCompact, setAutoCompact] = useState(false);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const naturalWidthRef = useRef(0);

  useEffect(() => {
    if (forcedCompact) return;
    const wrapper = wrapperRef.current;
    const root = wrapper?.closest<HTMLElement>('[data-slot=navbar]');
    if (!wrapper || !root) return;
    const left = root.querySelector<HTMLElement>('[data-slot=navbar-left]');
    const right = root.querySelector<HTMLElement>('[data-slot=navbar-right]');

    const measure = () => {
      // The natural width is captured once, from the non-compact layout.
      if (naturalWidthRef.current === 0) {
        const stepper = wrapper.querySelector<HTMLElement>('[data-slot=stepper]');
        naturalWidthRef.current = stepper?.scrollWidth ?? 0;
      }
      // Centered on the bar, the stepper may extend as far on each side as the
      // wider side group allows.
      const sideWidth = Math.max(left?.offsetWidth ?? 0, right?.offsetWidth ?? 0);
      const available = Math.max(root.clientWidth - 2 * sideWidth - SIDE_GUTTER, 0);
      setMaxWidth(available);
      setAutoCompact(naturalWidthRef.current > 0 && available < naturalWidthRef.current);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    if (left) observer.observe(left);
    if (right) observer.observe(right);
    return () => {
      observer.disconnect();
      naturalWidthRef.current = 0;
    };
  }, [steps.length, forcedCompact]);

  const isCompact = forcedCompact || autoCompact;

  return (
    <div
      ref={wrapperRef}
      className={cn('flex items-center justify-center overflow-hidden', isCompact && 'w-full', className)}
      style={forcedCompact ? undefined : { maxWidth, width: isCompact ? maxWidth : undefined }}
    >
      <Stepper
        className={cn(isCompact ? 'w-full' : 'w-auto')}
        value={stepperActiveStepIndex + 1}
        onValueChange={(value) => {
          const targetStep = steps[value - 1];
          if (targetStep?.isAvailable && targetStep.navigateTo) {
            navigate(targetStep.navigateTo);
          }
        }}
        indicators={{
          completed: <Check className="size-3 text-primary" strokeWidth={2.5} />,
        }}
      >
        <StepperNav>
          {steps.map((step, index) => (
            <StepperItem
              key={index}
              step={index + 1}
              disabled={!step.isAvailable}
              className={cn(isCompact && 'relative flex-1 items-start')}
              style={!isCompact ? { minWidth: `calc(${step.label.length}ch + 24px)` } : undefined}
            >
              <StepperTrigger className={cn(isCompact && 'flex-col')}>
                <StepperIndicator className="size-5 text-xs data-[state=inactive]:text-ring">
                  {index + 1}
                </StepperIndicator>
                <StepperTitle
                  className={cn(
                    'px-1 text-xs font-medium',
                    isCompact ? 'w-full truncate text-center' : 'whitespace-nowrap',
                    index <= stepperActiveStepIndex ? 'text-foreground' : 'text-ring',
                  )}
                >
                  {step.label}
                </StepperTitle>
              </StepperTrigger>
              {index < steps.length - 1 && (
                <StepperSeparator
                  className={cn(
                    'bg-ring opacity-40',
                    isCompact
                      ? 'absolute top-2.5 left-[calc(50%+1.5rem)] m-0 w-[calc(100%-3rem)] flex-none'
                      : 'mx-2 w-6 group-data-[orientation=horizontal]/stepper-nav:h-px group-data-[orientation=horizontal]/stepper-nav:flex-none',
                  )}
                />
              )}
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>
    </div>
  );
});

FunnelStepper.displayName = 'FunnelStepper';
