import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CheckIcon, LoaderCircleIcon } from 'lucide-react';
import { Button } from './button';
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  useStepper,
} from './stepper';

const STEPS = [
  { title: 'Workspace', description: 'Name and logo' },
  { title: 'Team', description: 'Invite your colleagues' },
  { title: 'Plan', description: 'Choose a subscription' },
  { title: 'Done', description: 'Start using the app' },
];

const INDICATORS = {
  completed: <CheckIcon className="size-3.5" />,
  loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
};

function StepFooter() {
  const { activeStep, setActiveStep } = useStepper();
  return (
    <div className="flex justify-between">
      <Button variant="outline" disabled={activeStep === 1} onClick={() => setActiveStep(activeStep - 1)}>Back</Button>
      <Button disabled={activeStep === STEPS.length} onClick={() => setActiveStep(activeStep + 1)}>Next</Button>
    </div>
  );
}

const meta = {
  title: 'Components/UI/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
  args: { defaultValue: 2, indicators: INDICATORS, onValueChange: fn() },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  render: (args, { parameters }) => (
    <Stepper {...args} className="max-w-2xl flex-col gap-8">
      <StepperNav>
        {STEPS.map((step, i) => (
          <StepperItem key={step.title} step={i + 1} loading={parameters['loading'] === true}>
            <StepperTrigger>
              <StepperIndicator>{i + 1}</StepperIndicator>
              <StepperTitle>{step.title}</StepperTitle>
            </StepperTrigger>
            {i < STEPS.length - 1 && <StepperSeparator className="group-data-[state=completed]/step:bg-primary" />}
          </StepperItem>
        ))}
      </StepperNav>
      <StepperPanel className="text-sm">
        {STEPS.map((step, i) => (
          <StepperContent key={step.title} value={i + 1} className="flex h-32 items-center justify-center rounded-md border border-dashed">
            {step.title} — {step.description}
          </StepperContent>
        ))}
      </StepperPanel>
      <StepFooter />
    </Stepper>
  ),
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstStep: Story = { args: { defaultValue: 1 } };

export const LastStep: Story = { args: { defaultValue: 4 } };

/** The active step shows a spinner. */
export const Loading: Story = { parameters: { loading: true } };

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Stepper {...args} className="max-w-md">
      <StepperNav>
        {STEPS.map((step, i) => (
          <StepperItem key={step.title} step={i + 1} className="relative items-start not-last:flex-1">
            <StepperTrigger className="items-start pb-12 last:pb-0">
              <StepperIndicator>{i + 1}</StepperIndicator>
              <div className="mt-0.5 flex flex-col gap-1 text-left">
                <StepperTitle>{step.title}</StepperTitle>
                <StepperDescription>{step.description}</StepperDescription>
              </div>
            </StepperTrigger>
            {i < STEPS.length - 1 && (
              <StepperSeparator className="absolute inset-y-0 top-7 left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)] group-data-[state=completed]/step:bg-primary" />
            )}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  ),
};
